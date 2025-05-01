/**
 * 增强的 Pinterest Scraper 测试
 * 使用 TypeScript、ESM 和 Sinon 来提高代码覆盖率
 */

import { jest, describe, expect, it, beforeEach, afterEach, afterAll } from '@jest/globals';
import fs from 'fs';
import sinon from 'sinon';
import puppeteer from 'puppeteer-core';

// 导入需要测试的模块
import PinterestScraper from '../pinterest-scraper.js';

// 预定义一些类型以解决 TypeScript 错误
type MockPage = {
  evaluate: sinon.SinonStub;
};

// 保存原始函数和方法
const originalWriteFileSync = fs.writeFileSync;
const originalFetch = global.fetch;
const originalExistsSync = fs.existsSync;

describe('增强的 PinterestScraper 测试', () => {
  let scraper: PinterestScraper;
  // 使用sinon创建存根
  let writeFileSyncStub: sinon.SinonStub;
  let fetchStub: sinon.SinonStub;
  let existsSyncStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;
  
  beforeEach(() => {
    // 创建一个sinon沙箱来管理所有存根
    sandbox = sinon.createSandbox();
    
    // 为fs.writeFileSync创建存根
    writeFileSyncStub = sandbox.stub(fs, 'writeFileSync');
    
    // 为fs.existsSync创建存根，默认返回true
    existsSyncStub = sandbox.stub(fs, 'existsSync').returns(true);
    
    // 为global.fetch创建存根
    fetchStub = sandbox.stub(global, 'fetch').resolves({
      ok: true,
      status: 200,
      arrayBuffer: () => Promise.resolve(new Uint8Array([1, 2, 3, 4]).buffer)
    } as Response);
    
    // 为puppeteer.launch创建存根，确保包含所有必要的Browser接口方法
    const mockBrowser = {
      newPage: sinon.stub().resolves({
        setViewport: sinon.stub().resolves(undefined),
        setUserAgent: sinon.stub().resolves(undefined),
        setDefaultNavigationTimeout: sinon.stub(),
        setDefaultTimeout: sinon.stub(),
        setRequestInterception: sinon.stub().resolves(undefined),
        on: sinon.stub(),
        goto: sinon.stub().resolves(undefined),
        waitForSelector: sinon.stub().resolves(undefined),
        evaluate: sinon.stub().resolves([
          { title: '测试图片1', image_url: 'https://i.pinimg.com/236x/test1.jpg', link: 'https://pinterest.com/pin/1' },
          { title: '测试图片2', image_url: 'https://i.pinimg.com/236x/test2.jpg', link: 'https://pinterest.com/pin/2' }
        ]),
        removeAllListeners: sinon.stub()
      }),
      close: sinon.stub().resolves(undefined),
      // 添加Browser接口所需的其他方法
      process: sinon.stub(),
      createBrowserContext: sinon.stub(),
      browserContexts: [],
      defaultBrowserContext: sinon.stub(),
      // 其他任何需要的方法...
      version: sinon.stub().returns('1.0.0'),
      userAgent: sinon.stub().returns('Mozilla/5.0'),
      wsEndpoint: sinon.stub().returns('ws://localhost:1234'),
      target: sinon.stub(),
      targets: sinon.stub().returns([]),
      waitForTarget: sinon.stub(),
      pages: sinon.stub().resolves([])
    };
    
    sandbox.stub(puppeteer, 'launch').resolves(mockBrowser as any);
    
    scraper = new PinterestScraper();
  });
  
  afterEach(() => {
    // 恢复所有存根
    sandbox.restore();
  });
  
  // 测试基本实例化
  describe('构造函数和基本初始化', () => {
    it('应该正确初始化属性', () => {
      expect(scraper.baseUrl).toBe('https://www.pinterest.com');
      expect(scraper.searchUrl).toBe('https://www.pinterest.com/search/pins/?q=');
      expect(scraper.chromePaths).toBeDefined();
    });
  });
  
  // 测试基本搜索功能
  describe('search 方法', () => {
    it('应该返回搜索结果', async () => {
      // 创建一个符合AbortSignal类型的null
      const signal = null as unknown as AbortSignal;
      const results = await scraper.search('测试关键词', 10, true, signal);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });
    
    it('应该处理空关键词', async () => {
      const signal = null as unknown as AbortSignal;
      const results = await scraper.search('', 10, true, signal);
      expect(Array.isArray(results)).toBe(true);
    });
    
    it('应该使用默认参数', async () => {
      const signal = null as unknown as AbortSignal;
      const results = await scraper.search('测试关键词', 10, true, signal);
      expect(Array.isArray(results)).toBe(true);
    });
    
    it('应该处理取消信号', async () => {
      const controller = new AbortController();
      const signal = controller.signal;
      
      // 立即取消操作
      controller.abort();
      
      try {
        await scraper.search('测试关键词', 10, true, signal);
        // 如果没有抛出错误，则测试失败
        fail('Expected search to throw but it did not');
      } catch (error: any) {
        expect(error.message).toContain('操作被取消');
      }
    });
  });
  
  // 简化高级场景测试
  describe('search 方法高级场景', () => {
    it('应该处理无效参数', async () => {
      const signal = null as unknown as AbortSignal;
      const results = await scraper.search(null as any, -1, true, signal);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });
  
  // 测试自动滚动功能
  describe('autoScroll 方法', () => {
    it('应该执行页面滚动操作', async () => {
      const mockPage = {
        evaluate: sinon.stub().resolves(undefined)
      };
      
      const signal = null as unknown as AbortSignal;
      await scraper.autoScroll(mockPage as any, 2000, signal);
      expect(mockPage.evaluate.called).toBe(true);
    });
    
    it('应该处理取消信号', async () => {
      const mockPage = {
        evaluate: sinon.stub().resolves(undefined)
      };
      
      const controller = new AbortController();
      const signal = controller.signal;
      
      // 立即取消
      controller.abort();
      
      try {
        await scraper.autoScroll(mockPage as any, 2000, signal);
        fail('Expected autoScroll to throw but it did not');
      } catch (error: any) {
        expect(error.message).toContain('操作被取消');
      }
    });
    
    it('应该处理页面执行错误', async () => {
      const mockPage = {
        evaluate: sinon.stub().rejects(new Error('页面执行错误'))
      };
      
      const signal = null as unknown as AbortSignal;
      try {
        await scraper.autoScroll(mockPage as any, 2000, signal);
        fail('Expected autoScroll to throw but it did not');
      } catch (error: any) {
        expect(error.message).toBe('页面执行错误');
      }
    });
  });
  
  // 测试图片下载功能
  describe('downloadImage 方法', () => {
    it('应该成功下载图片', async () => {
      // 创建测试buffer
      const testBuffer = Buffer.from([1, 2, 3, 4]);
      
      // 配置fetch返回值
      fetchStub.resolves({
        ok: true,
        status: 200,
        arrayBuffer: sinon.stub().resolves(testBuffer)
      } as unknown as Response);
      
      const signal = null as unknown as AbortSignal;
      const success = await scraper.downloadImage('https://i.pinimg.com/originals/test.jpg', '/tmp/test.jpg', signal);
      
      expect(success).toBe(true);
      expect(fetchStub.calledWith('https://i.pinimg.com/originals/test.jpg')).toBe(true);
      expect(writeFileSyncStub.calledWith('/tmp/test.jpg', sinon.match.any)).toBe(true);
    });
    
    it('应该处理空URL或路径', async () => {
      const signal = null as unknown as AbortSignal;
      let success = await scraper.downloadImage('', '/tmp/test.jpg', signal);
      expect(success).toBe(false);
      
      success = await scraper.downloadImage('https://example.com/image.jpg', '', signal);
      expect(success).toBe(false);
    });
    
    it('应该处理响应错误', async () => {
      // 配置fetch返回错误响应
      fetchStub.resolves({
        ok: false,
        status: 404
      } as Response);
      
      const signal = null as unknown as AbortSignal;
      const success = await scraper.downloadImage('https://example.com/not-found.jpg', '/tmp/not-found.jpg', signal);
      expect(success).toBe(false);
    });
    
    it('应该处理网络错误', async () => {
      // 配置fetch抛出错误
      fetchStub.rejects(new Error('网络错误'));
      
      const signal = null as unknown as AbortSignal;
      const success = await scraper.downloadImage('https://example.com/network-error.jpg', '/tmp/network-error.jpg', signal);
      expect(success).toBe(false);
    });
    
    it('应该处理写入错误', async () => {
      // 配置writeFileSync抛出错误
      writeFileSyncStub.throws(new Error('写入错误'));
      
      const signal = null as unknown as AbortSignal;
      const success = await scraper.downloadImage('https://example.com/write-error.jpg', '/tmp/write-error.jpg', signal);
      
      // 确认存根被调用并抛出了错误
      expect(writeFileSyncStub.called).toBe(true);
      expect(success).toBe(false);
    });
    
    it('应该处理取消信号', async () => {
      const controller = new AbortController();
      const signal = controller.signal;
      
      // 立即取消
      controller.abort();
      
      const success = await scraper.downloadImage('https://example.com/cancelled.jpg', '/tmp/cancelled.jpg', signal);
      expect(success).toBe(false);
    });
    
    it('应该处理下载过程中取消', async () => {
      const controller = new AbortController();
      const signal = controller.signal;
      
      // 设置延迟响应
      fetchStub.callsFake(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              arrayBuffer: () => Promise.resolve(new Uint8Array([1, 2, 3, 4]).buffer)
            } as Response);
          }, 50);
        });
      });
      
      // 在fetch完成之前取消请求
      setTimeout(() => controller.abort(), 10);
      
      const success = await scraper.downloadImage('https://example.com/cancel-during-download.jpg', '/tmp/cancelled.jpg', signal);
      expect(success).toBe(false);
    });
  });
  
  // 测试 URL 转换功能
  describe('transformImageUrl 方法', () => {
    it('应该转换缩略图URL为原图URL', () => {
      const thumbnailUrl = 'https://i.pinimg.com/236x/ab/cd/ef.jpg';
      const expectedUrl = 'https://i.pinimg.com/originals/ab/cd/ef.jpg';
      
      expect(scraper.transformImageUrl(thumbnailUrl)).toBe(expectedUrl);
    });
    
    it('应该处理各种缩略图格式', () => {
      const formats = ['60x60', '236x', '474x', '736x'];
      
      formats.forEach(format => {
        const thumbnailUrl = `https://i.pinimg.com/${format}/ab/cd/ef.jpg`;
        const expectedUrl = 'https://i.pinimg.com/originals/ab/cd/ef.jpg';
        
        expect(scraper.transformImageUrl(thumbnailUrl)).toBe(expectedUrl);
      });
    });
    
    it('应该处理自定义尺寸格式', () => {
      const thumbnailUrl = 'https://i.pinimg.com/123x456/ab/cd/ef.jpg';
      const expectedUrl = 'https://i.pinimg.com/originals/ab/cd/ef.jpg';
      
      expect(scraper.transformImageUrl(thumbnailUrl)).toBe(expectedUrl);
    });
    
    it('应该保持非缩略图URL不变', () => {
      const nonThumbnailUrl = 'https://example.com/image.jpg';
      expect(scraper.transformImageUrl(nonThumbnailUrl)).toBe(nonThumbnailUrl);
    });
    
    it('应该处理空URL', () => {
      expect(scraper.transformImageUrl(undefined as any)).toBeUndefined();
      expect(scraper.transformImageUrl(null as any)).toBeNull();
      expect(scraper.transformImageUrl('')).toBe('');
    });
  });
}); 