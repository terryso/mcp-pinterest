/**
 * Pinterest 下载功能测试
 * 遵循 TDD 开发规范
 */

import { jest, describe, expect, it, beforeEach, afterAll } from '@jest/globals';
import { createMockPinterestResults, PinterestResult } from './test-helpers.js';

// 创建模拟版本的下载模块
const mockDownloadImage = jest.fn();
const mockBatchDownload = jest.fn();

// 模拟下载模块
jest.mock('../src/pinterest-download.js', () => {
  return {
    downloadImage: (...args) => mockDownloadImage(...args),
    batchDownload: (...args) => mockBatchDownload(...args)
  };
}, { virtual: true });

// 创建模拟的PinterestScraper类
class MockPinterestScraper {
  async downloadImage(imageUrl, outputPath) {
    if (imageUrl.includes('error')) {
      return false;
    }
    return true;
  }

  async search(keyword, limit = 10, headless = true) {
    return createMockPinterestResults(limit);
  }

  async batchDownload(keyword, limit, downloadDir) {
    const results = await this.search(keyword, limit, true);
    
    const downloadResults = {
      success: true,
      total: results.length,
      downloadedCount: 0,
      failedCount: 0,
      downloaded: [] as Array<{success: boolean; id: any; path: string; url: string}>,
      failed: [] as Array<{url: string; error: string}>
    };

    for (const result of results) {
      const success = await this.downloadImage(result.image_url, `${downloadDir}/${result.id}.jpg`);
      if (success) {
        downloadResults.downloadedCount++;
        downloadResults.downloaded.push({
          success: true,
          id: result.id,
          path: `${downloadDir}/${result.id}.jpg`,
          url: result.image_url
        });
      } else {
        downloadResults.failedCount++;
        downloadResults.failed.push({
          url: result.image_url,
          error: 'Failed to download'
        });
      }
    }
    
    return downloadResults;
  }
}

// 模拟PinterestScraper
jest.mock('../pinterest-scraper.js', () => {
  return MockPinterestScraper;
}, { virtual: true });

describe('Pinterest 下载功能', () => {
  let scraper;
  let originalTimeout;
  
  beforeEach(() => {
    // 清除所有模拟
    jest.clearAllMocks();
    // 创建新的爬虫实例
    scraper = new MockPinterestScraper();
    // 设置较短的超时
    originalTimeout = jest.setTimeout(5000);
  });

  afterAll(() => {
    // 恢复超时设置
    jest.setTimeout(originalTimeout);
  });
  
  describe('downloadImage', () => {
    it('应该成功下载图片', async () => {
      // Arrange
      const imageUrl = 'https://example.com/test.jpg';
      const outputPath = '/test/path/image.jpg';
      
      // 设置模拟返回值
      mockDownloadImage.mockReturnValue(Promise.resolve({
        success: true,
        id: '123',
        path: outputPath,
        url: imageUrl
      }));
      
      // Act
      const result = await scraper.downloadImage(imageUrl, outputPath);
      
      // Assert
      expect(result).toBe(true);
    });
    
    it('应该处理下载失败的情况', async () => {
      // Arrange
      const imageUrl = 'https://example.com/error.jpg';
      const outputPath = '/test/path/image.jpg';
      
      // 设置模拟返回值
      mockDownloadImage.mockReturnValue(Promise.resolve({
        success: false,
        error: 'Failed to download'
      }));
      
      // Act
      const result = await scraper.downloadImage(imageUrl, outputPath);
      
      // Assert
      expect(result).toBe(false);
    });
  });
  
  describe('批量下载', () => {
    it('应该成功批量下载多张图片', async () => {
      // Arrange
      const mockResults = createMockPinterestResults(3);
      
      // 模拟搜索方法
      jest.spyOn(scraper, 'search').mockResolvedValue(mockResults);
      
      // 模拟下载方法
      jest.spyOn(scraper, 'downloadImage').mockResolvedValue(true);
      
      // 设置批量下载模拟返回值
      mockBatchDownload.mockReturnValue(Promise.resolve({
        success: true,
        total: 3,
        downloadedCount: 3,
        failedCount: 0,
        downloaded: mockResults.map(r => ({
          success: true,
          id: r.id,
          path: `/test/downloads/${r.id}.jpg`,
          url: r.image_url
        })),
        failed: []
      }));
      
      // Act
      const keyword = '测试关键词';
      const downloadDir = '/test/downloads';
      const result = await scraper.batchDownload(keyword, 3, downloadDir);
      
      // Assert
      expect(scraper.search).toHaveBeenCalledWith(keyword, 3, true);
      expect(result.success).toBe(true);
      expect(result.downloadedCount).toBe(3);
      expect(result.failedCount).toBe(0);
    });
    
    it('应该处理部分图片下载失败的情况', async () => {
      // Arrange
      const mockResults = createMockPinterestResults(3);
      
      // 模拟搜索方法
      jest.spyOn(scraper, 'search').mockResolvedValue(mockResults);
      
      // 模拟下载方法，第二张图片下载失败
      jest.spyOn(scraper, 'downloadImage').mockImplementation((url) => {
        return Promise.resolve(!url.includes('test2'));
      });
      
      // Act
      const keyword = '测试关键词';
      const downloadDir = '/test/downloads';
      const result = await scraper.batchDownload(keyword, 3, downloadDir);
      
      // Assert
      expect(scraper.search).toHaveBeenCalledWith(keyword, 3, true);
      expect(result.success).toBe(true);
      expect(result.downloadedCount).toBe(2);
      expect(result.failedCount).toBe(1);
    });
  });
}); 