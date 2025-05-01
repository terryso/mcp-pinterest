/**
 * Pinterest 下载模块单元测试
 * 专门测试src/pinterest-download.js
 * 遵循 TDD 开发规范
 */

import { jest, describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { downloadImage, batchDownload } from '../src/pinterest-download.js';

// 定义接口（确保与实现中的类型一致）
interface PinterestResult {
  id?: string;
  image_url: string;
}

// 使用临时目录路径而不是绝对路径
const TEST_DOWNLOAD_DIR = './test-downloads';
const TEST_ERROR_DIR = './test-error';
const TEST_NOT_EXISTS_DIR = './test-not-exists';
const TEST_BATCH_DIR = './test-batch';

describe('Pinterest 下载模块', () => {
  // 测试前设置
  beforeEach(() => {
    // 清除所有模拟调用记录
    jest.clearAllMocks();
    
    // 模拟dependencies
    jest.spyOn(axios, 'get').mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('error')) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({ data: Buffer.from('测试图片数据') });
    });
    
    jest.spyOn(fs, 'existsSync').mockImplementation((dirPath) => {
      if (typeof dirPath === 'string') {
        return !dirPath.includes('not-exists');
      }
      return true;
    });
    
    jest.spyOn(fs.promises, 'mkdir').mockImplementation((dirPath) => {
      if (typeof dirPath === 'string' && dirPath.includes('error')) {
        return Promise.reject(new Error('Permission denied'));
      }
      return Promise.resolve();
    });
    
    jest.spyOn(fs.promises, 'writeFile').mockImplementation((filePath) => {
      if (typeof filePath === 'string' && filePath.includes('error')) {
        return Promise.reject(new Error('Permission denied'));
      }
      return Promise.resolve();
    });
    
    jest.spyOn(path, 'join').mockImplementation((...args) => args.join('/'));
  });
  
  // 测试后清理
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('downloadImage', () => {
    it('应该成功下载图片', async () => {
      // 准备测试数据
      const pinterestResult = {
        id: 'test123',
        image_url: 'https://example.com/test.jpg'
      };
      const downloadDir = TEST_DOWNLOAD_DIR;

      // 执行
      const result = await downloadImage(pinterestResult, downloadDir);

      // 验证
      expect(axios.get).toHaveBeenCalledWith('https://example.com/test.jpg', { responseType: 'arraybuffer' });
      expect(fs.promises.writeFile).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        id: 'test123',
        path: expect.stringContaining('test123'),
        url: 'https://example.com/test.jpg'
      });
    });

    it('应该从URL提取ID（当未提供ID时）', async () => {
      // 准备测试数据 - 提取最后一部分文件名(ab)作为ID
      const pinterestResult = {
        image_url: 'https://i.pinimg.com/originals/ab/cd/ef.jpg'
      };
      const downloadDir = TEST_DOWNLOAD_DIR;

      // 模拟urlParts[urlParts.length - 1]是'ab.jpg'
      jest.spyOn(String.prototype, 'split').mockImplementationOnce(() => {
        return ['https:', '', 'i.pinimg.com', 'originals', 'ab.jpg'];
      });

      // 执行
      const result = await downloadImage(pinterestResult, downloadDir);

      // 验证
      expect(result.id).toBe('ab');
      
      // 恢复String.prototype.split的实现
      jest.spyOn(String.prototype, 'split').mockRestore();
    });

    it('应该处理网络错误', async () => {
      // 准备测试数据
      const pinterestResult = {
        id: 'test123',
        image_url: 'https://example.com/error.jpg'
      };
      const downloadDir = TEST_DOWNLOAD_DIR;

      // 执行和验证
      await expect(downloadImage(pinterestResult, downloadDir))
        .rejects.toThrow('Network error');
    });

    it('应该处理文件写入错误', async () => {
      // 准备测试数据
      const pinterestResult = {
        id: 'test123',
        image_url: 'https://example.com/test.jpg'
      };
      const downloadDir = TEST_ERROR_DIR;

      // 改变模拟实现
      jest.spyOn(fs.promises, 'writeFile').mockRejectedValueOnce(new Error('Write error'));

      // 执行和验证
      await expect(downloadImage(pinterestResult, downloadDir))
        .rejects.toThrow('Write error');
    });

    it('应该创建目录（当目录不存在时）', async () => {
      // 准备测试数据
      const pinterestResult = {
        id: 'test123',
        image_url: 'https://example.com/test.jpg'
      };
      const downloadDir = TEST_NOT_EXISTS_DIR;

      // 执行
      await downloadImage(pinterestResult, downloadDir);

      // 验证
      expect(fs.existsSync).toHaveBeenCalledWith(TEST_NOT_EXISTS_DIR);
      expect(fs.promises.mkdir).toHaveBeenCalledWith(TEST_NOT_EXISTS_DIR, { recursive: true });
    });
  });

  describe('batchDownload', () => {
    it('应该成功批量下载图片', async () => {
      // 准备测试数据
      const results = [
        { id: 'test1', image_url: 'https://example.com/test1.jpg' },
        { id: 'test2', image_url: 'https://example.com/test2.jpg' },
        { id: 'test3', image_url: 'https://example.com/test3.jpg' }
      ];
      const downloadDir = TEST_BATCH_DIR;

      // 执行
      const result = await batchDownload(results, downloadDir);

      // 验证
      expect(axios.get).toHaveBeenCalledTimes(3);
      expect(fs.promises.writeFile).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        success: true,
        total: 3,
        downloadedCount: 3,
        failedCount: 0,
        downloaded: expect.arrayContaining([
          expect.objectContaining({ success: true, id: 'test1' }),
          expect.objectContaining({ success: true, id: 'test2' }),
          expect.objectContaining({ success: true, id: 'test3' })
        ]),
        failed: []
      });
    });

    it('应该处理部分图片下载失败的情况', async () => {
      // 准备测试数据
      const results = [
        { id: 'test1', image_url: 'https://example.com/test1.jpg' },
        { id: 'test2', image_url: 'https://example.com/error.jpg' },
        { id: 'test3', image_url: 'https://example.com/test3.jpg' }
      ];
      const downloadDir = TEST_BATCH_DIR;

      // 执行
      const result = await batchDownload(results, downloadDir);

      // 验证
      expect(result.success).toBe(true);
      expect(result.total).toBe(3);
      expect(result.downloadedCount).toBe(2);
      expect(result.failedCount).toBe(1);
      expect(result.downloaded).toHaveLength(2);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].url).toBe('https://example.com/error.jpg');
    });

    it('应该创建下载目录（当目录不存在时）', async () => {
      // 准备测试数据
      const results = [
        { id: 'test1', image_url: 'https://example.com/test1.jpg' }
      ];
      const downloadDir = TEST_NOT_EXISTS_DIR + '/batch';

      // 执行
      await batchDownload(results, downloadDir);

      // 验证
      expect(fs.existsSync).toHaveBeenCalledWith(TEST_NOT_EXISTS_DIR + '/batch');
      expect(fs.promises.mkdir).toHaveBeenCalledWith(TEST_NOT_EXISTS_DIR + '/batch', { recursive: true });
    });

    it('应该处理空结果数组', async () => {
      // 准备测试数据
      const results = [];
      const downloadDir = TEST_BATCH_DIR;

      // 执行
      const result = await batchDownload(results, downloadDir);

      // 验证
      expect(result.success).toBe(true);
      expect(result.total).toBe(0);
      expect(result.downloadedCount).toBe(0);
      expect(result.failedCount).toBe(0);
    });

    it('应该处理结果中的无效对象', async () => {
      // 准备测试数据
      const results = [
        { id: 'test1', image_url: 'https://example.com/test1.jpg' },
        null as any,
        { id: 'test3' } as any, // 缺少image_url
        { image_url: 'https://example.com/test4.jpg' } // 缺少id但有效
      ];
      const downloadDir = TEST_BATCH_DIR;

      // 执行
      const result = await batchDownload(results, downloadDir);

      // 验证
      expect(result.downloadedCount).toBe(2); // 第一个和最后一个有效
      expect(result.failedCount).toBe(0); // 无效项被忽略，不计入失败
    });
  });
}); 