import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';
import { generateFileName, DEFAULT_FILENAME_TEMPLATE } from './filename-template.js';

// 从环境变量获取代理设置
const PROXY_SERVER = process.env.MCP_PINTEREST_PROXY_SERVER || '';
const PROXY_ENABLED = !!PROXY_SERVER;

// 如果设置了代理服务器，配置axios使用代理
const axiosConfig = {
  timeout: 30000, // 30秒超时
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  }
};

// 如果启用了代理，添加代理配置
if (PROXY_ENABLED) {
  // 从代理字符串中提取协议、主机和端口
  // 格式应该是 "http://host:port" 或 "socks5://host:port"
  const proxyMatch = PROXY_SERVER.match(/^(https?|socks[45]):\/\/([^:]+):(\d+)/i);
  
  if (proxyMatch) {
    const [, protocol, host, port] = proxyMatch;
    console.log(`下载图片使用代理: ${protocol}://${host}:${port}`);
    
    axiosConfig.proxy = {
      protocol,
      host,
      port: Number.parseInt(port, 10)
    };
  } else {
    console.warn(`代理格式无效: ${PROXY_SERVER}，格式应为 "http://host:port" 或 "socks5://host:port"`);
  }
}

/**
 * 下载Pinterest图片到指定目录，带有重试机制
 * @param {Object} pinterestResult - Pinterest搜索结果对象
 * @param {string} pinterestResult.id - 图片ID
 * @param {string} pinterestResult.image_url - 图片URL
 * @param {string} downloadDir - 下载目录路径
 * @param {Object} [options] - 可选配置项
 * @param {string} [options.filenameTemplate=DEFAULT_FILENAME_TEMPLATE] - 文件名模板
 * @param {number} [options.maxRetries=3] - 最大重试次数
 * @param {number} [options.index] - 在批量下载中的索引（可选）
 * @returns {Promise<Object>} 下载结果
 */
export async function downloadImage(pinterestResult, downloadDir, options = {}) {
  const {
    filenameTemplate = DEFAULT_FILENAME_TEMPLATE,
    maxRetries = 3,
    index
  } = options;
  
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

      // 获取文件扩展名
      const fileExtension = pinterestResult.image_url.split('.').pop().split('?')[0] || 'jpg';
      
      // 使用模板生成文件名
      const fileName = generateFileName(filenameTemplate, {
        imageId,
        fileExtension,
        index
      });
      
      const outputPath = path.join(downloadDir, fileName);

      // 使用配置好的axios下载图片
      const requestConfig = {
        ...axiosConfig,
        responseType: 'arraybuffer'
      };
      
      const response = await axios.get(pinterestResult.image_url, requestConfig);

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
 * @param {Object} [options] - 可选配置项
 * @param {string} [options.filenameTemplate=DEFAULT_FILENAME_TEMPLATE] - 文件名模板
 * @param {number} [options.maxRetries=3] - 最大重试次数
 * @returns {Promise<Object>} 批量下载结果
 */
export async function batchDownload(results, downloadDir, options = {}) {
  const {
    filenameTemplate = DEFAULT_FILENAME_TEMPLATE,
    maxRetries = 3
  } = options;
  
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
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    try {
      if (result?.image_url) {
        const downloadResult = await downloadImage(result, downloadDir, {
          filenameTemplate,
          maxRetries,
          index: i + 1
        });
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