import fs from 'fs';
import path from 'path';
import axios from 'axios';

/**
 * 下载Pinterest图片到指定目录
 * @param {Object} pinterestResult - Pinterest搜索结果对象
 * @param {string} pinterestResult.id - 图片ID
 * @param {string} pinterestResult.image_url - 图片URL
 * @param {string} downloadDir - 下载目录路径
 * @returns {Promise<Object>} 下载结果
 */
export async function downloadImage(pinterestResult, downloadDir) {
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

    // 下载图片
    const response = await axios.get(pinterestResult.image_url, { responseType: 'arraybuffer' });

    // 保存图片到文件
    await fs.promises.writeFile(outputPath, Buffer.from(response.data));

    return {
      success: true,
      id: imageId,
      path: outputPath,
      url: pinterestResult.image_url
    };
  } catch (error) {
    // Only log errors when not in a test environment
    if (process.env.NODE_ENV !== 'test') {
      console.error(`下载图片失败: ${error.message}`);
    }
    throw error;
  }
}

/**
 * 批量下载Pinterest图片
 * @param {Array} results - Pinterest搜索结果数组
 * @param {string} downloadDir - 下载目录路径
 * @returns {Promise<Object>} 批量下载结果
 */
export async function batchDownload(results, downloadDir) {
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
      if (result && result.image_url) {
        const downloadResult = await downloadImage(result, downloadDir);
        downloadResults.downloaded.push(downloadResult);
        downloadResults.downloadedCount++;
      }
    } catch (error) {
      downloadResults.failed.push({
        url: result.image_url,
        error: error.message
      });
      downloadResults.failedCount++;
    }
  }

  return downloadResults;
}