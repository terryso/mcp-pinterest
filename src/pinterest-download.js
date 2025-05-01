import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';

/**
 * 下载Pinterest图片到指定目录，带有重试机制
 * @param {Object} pinterestResult - Pinterest搜索结果对象
 * @param {string} pinterestResult.id - 图片ID
 * @param {string} pinterestResult.image_url - 图片URL
 * @param {string} downloadDir - 下载目录路径
 * @param {number} maxRetries - 最大重试次数
 * @returns {Promise<Object>} 下载结果
 */
export async function downloadImage(pinterestResult, downloadDir, maxRetries = 3) {
  let retries = 0;
  let lastError = null;

  while (retries <= maxRetries) {
    try {
      // 确保下载目录存在
      if (!fs.existsSync(downloadDir)) {
        await fs.promises.mkdir(downloadDir, { recursive: true });
      }

      // 从URL中提取图片ID
      let imageId = pinterestResult.id;
      if (!imageId) {
        // 如果没有ID，从URL中提取
        const urlParts = pinterestResult.image_url.split('/');
        imageId = urlParts[urlParts.length - 1].split('.')[0];
      }

      // 创建文件名
      const fileExtension = pinterestResult.image_url.split('.').pop().split('?')[0] || 'jpg';
      const fileName = `pinterest_${imageId}.${fileExtension}`;
      const outputPath = path.join(downloadDir, fileName);

      // 下载图片，添加超时设置和重试延迟
      const timeout = 30000; // 30秒超时
      const response = await axios.get(pinterestResult.image_url, { 
        responseType: 'arraybuffer',
        timeout: timeout,
        // 设置重试时指数增长的延迟
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        }
      });

      // 保存图片到文件
      await fs.promises.writeFile(outputPath, Buffer.from(response.data));

      return {
        success: true,
        id: imageId,
        path: outputPath,
        url: pinterestResult.image_url
      };
    } catch (error) {
      lastError = error;
      
      // 是否值得重试的错误
      const isRetryableError = error.code === 'ECONNABORTED' || 
                               error.code === 'ETIMEDOUT' || 
                               error.message.includes('Connection closed') ||
                               error.message.includes('timeout') ||
                               (error.response && error.response.status >= 500);
                               
      if (isRetryableError && retries < maxRetries) {
        // 计算指数退避延迟时间 (1s, 2s, 4s, ...)
        const delay = 2 ** retries * 1000;
        // Only log errors when not in a test environment
        if (process.env.NODE_ENV !== 'test') {
          console.log(`下载重试 (${retries + 1}/${maxRetries}) 延迟 ${delay}ms: ${pinterestResult.image_url}`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
      } else {
        // 达到最大重试次数或不可重试的错误
        if (process.env.NODE_ENV !== 'test') {
          console.error(`下载图片失败 (重试了 ${retries} 次): ${error.message}`);
        }
        throw error;
      }
    }
  }
  
  // 如果所有重试都失败了
  throw lastError;
}

/**
 * 批量下载Pinterest图片
 * @param {Array} results - Pinterest搜索结果数组
 * @param {string} downloadDir - 下载目录路径
 * @param {number} maxRetries - 最大重试次数
 * @returns {Promise<Object>} 批量下载结果
 */
export async function batchDownload(results, downloadDir, maxRetries = 3) {
  // 确保下载目录存在
  if (!fs.existsSync(downloadDir)) {
    await fs.promises.mkdir(downloadDir, { recursive: true });
  }

  const downloadResults = {
    success: true,
    total: results.length,
    downloadedCount: 0,
    failedCount: 0,
    downloaded: [],
    failed: []
  };

  // 批量下载图片
  for (const result of results) {
    try {
      if (result?.image_url) {
        const downloadResult = await downloadImage(result, downloadDir, maxRetries);
        downloadResults.downloaded.push(downloadResult);
        downloadResults.downloadedCount++;
      }
    } catch (error) {
      downloadResults.failed.push({
        url: result?.image_url ?? 'unknown',
        error: error.message
      });
      downloadResults.failedCount++;
    }
  }

  return downloadResults;
}