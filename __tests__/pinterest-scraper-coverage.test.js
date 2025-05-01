/**
 * Pinterest Scraper 代码覆盖率测试
 * 
 * 此测试文件专注于提高 pinterest-scraper.js 的代码覆盖率
 * 使用实际的 PinterestScraper 类而不是模拟对象
 * 使用sinon代替jest.mock
 */

// 导入必要的模块
import { jest, describe, it, expect, beforeEach, afterEach, afterAll } from '@jest/globals';
import sinon from 'sinon';
import fs from 'fs';
import puppeteer from 'puppeteer-core';

// 导入实际的 PinterestScraper 类
import PinterestScraper from '../pinterest-scraper.js';

describe('PinterestScraper代码覆盖率测试', () => {
  let scraper;
  let sandbox;
  
  beforeEach(() => {
    // 创建一个sinon沙箱来管理所有模拟
    sandbox = sinon.createSandbox();
    
    // 模拟puppeteer.launch方法
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
        removeAllListeners: sinon.stub(),
      }),
      close: sinon.stub().resolves(undefined),
      // 添加Browser接口所需的其他方法
      process: sinon.stub(),
      createBrowserContext: sinon.stub(),
      browserContexts: [],
      defaultBrowserContext: sinon.stub(),
      version: sinon.stub().returns('1.0.0'),
      userAgent: sinon.stub().returns('Mozilla/5.0'),
      wsEndpoint: sinon.stub().returns('ws://localhost:1234'),
      target: sinon.stub(),
      targets: sinon.stub().returns([]),
      waitForTarget: sinon.stub(),
      pages: sinon.stub().resolves([])
    };
    
    sandbox.stub(puppeteer, 'launch').resolves(mockBrowser);
    
    // 模拟fs模块的方法
    sandbox.stub(fs, 'writeFileSync');
    sandbox.stub(fs, 'existsSync').returns(true);
    sandbox.stub(fs, 'mkdirSync');
    
    // 保存和模拟原始fetch
    global.originalFetch = global.fetch;
    global.fetch = sandbox.stub().resolves({
      ok: true,
      status: 200,
      arrayBuffer: () => Promise.resolve(Buffer.from('测试图片数据').buffer)
    });
    
    // 创建PinterestScraper实例
    scraper = new PinterestScraper();
  });
  
  afterEach(() => {
    // 恢复所有模拟
    sandbox.restore();
    // 恢复原始fetch
    if (global.originalFetch) {
      global.fetch = global.originalFetch;
    }
  });
  
  // 测试构造函数
  describe('构造函数', () => {
    it('应该正确初始化属性', () => {
      expect(scraper.baseUrl).toBe('https://www.pinterest.com');
      expect(scraper.searchUrl).toBe('https://www.pinterest.com/search/pins/?q=');
      expect(scraper.chromePaths).toBeDefined();
      expect(Object.keys(scraper.chromePaths)).toContain('mac');
      expect(Object.keys(scraper.chromePaths)).toContain('linux');
      expect(Object.keys(scraper.chromePaths)).toContain('win');
    });
  });
  
  // 测试 search 方法
  describe('search方法', () => {
    it('应该返回搜索结果', async () => {
      const results = await scraper.search('测试关键词', 10, true, null);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });
    
    it('应该处理空关键词', async () => {
      const results = await scraper.search('', 10, true, null);
      expect(Array.isArray(results)).toBe(true);
    });
    
    it('应该处理带有取消信号的搜索', async () => {
      const controller = new AbortController();
      const signal = controller.signal;
      
      // 立即取消
      controller.abort();
      
      await expect(async () => {
        await scraper.search('测试', 10, true, signal);
      }).rejects.toThrow('操作被取消');
    });
    
    it('应该处理搜索过程中的错误', async () => {
      // 模拟puppeteer启动失败
      sandbox.restore(); // 清除之前的stub
      sandbox = sinon.createSandbox();
      sandbox.stub(puppeteer, 'launch').rejects(new Error('启动失败'));
      
      const results = await scraper.search('测试', 10, true, null);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
    
    it('应该处理页面创建失败', async () => {
      // 模拟页面创建失败
      sandbox.restore(); // 清除之前的stub
      sandbox = sinon.createSandbox();
      const mockBrowser = {
        newPage: sinon.stub().rejects(new Error('页面创建失败')),
        close: sinon.stub().resolves(undefined)
      };
      sandbox.stub(puppeteer, 'launch').resolves(mockBrowser);
      
      const results = await scraper.search('测试', 10, true, null);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
    
    it('应该处理页面导航失败', async () => {
      // 模拟导航失败
      sandbox.restore(); // 清除之前的stub
      sandbox = sinon.createSandbox();
      const mockBrowser = {
        newPage: sinon.stub().resolves({
          setViewport: sinon.stub().resolves(undefined),
          setUserAgent: sinon.stub().resolves(undefined),
          setDefaultNavigationTimeout: sinon.stub(),
          setDefaultTimeout: sinon.stub(),
          setRequestInterception: sinon.stub().resolves(undefined),
          on: sinon.stub(),
          goto: sinon.stub().rejects(new Error('导航失败')),
          removeAllListeners: sinon.stub()
        }),
        close: sinon.stub().resolves(undefined)
      };
      sandbox.stub(puppeteer, 'launch').resolves(mockBrowser);
      
      const results = await scraper.search('测试', 10, true, null);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
    
    it('应该处理图片提取失败', async () => {
      // 模拟图片提取失败
      sandbox.restore(); // 清除之前的stub
      sandbox = sinon.createSandbox();
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
          evaluate: sinon.stub().rejects(new Error('提取失败')),
          removeAllListeners: sinon.stub()
        }),
        close: sinon.stub().resolves(undefined)
      };
      sandbox.stub(puppeteer, 'launch').resolves(mockBrowser);
      
      const results = await scraper.search('测试', 10, true, null);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
    
    it('应该处理非数组结果', async () => {
      // 模拟非数组结果
      sandbox.restore(); // 清除之前的stub
      sandbox = sinon.createSandbox();
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
          evaluate: sinon.stub().resolves("非数组结果"),
          removeAllListeners: sinon.stub()
        }),
        close: sinon.stub().resolves(undefined)
      };
      sandbox.stub(puppeteer, 'launch').resolves(mockBrowser);
      
      const results = await scraper.search('测试', 10, true, null);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });
  
  // 测试 autoScroll 方法
  describe('autoScroll方法', () => {
    it('应该执行页面滚动', async () => {
      const mockPage = {
        evaluate: sinon.stub().resolves(undefined)
      };
      
      await scraper.autoScroll(mockPage, 2000, null);
      expect(mockPage.evaluate.called).toBe(true);
    });
    
    it('应该响应取消信号', async () => {
      const mockPage = {
        evaluate: sinon.stub().resolves(undefined)
      };
      
      const controller = new AbortController();
      const signal = controller.signal;
      
      // 立即取消
      controller.abort();
      
      await expect(async () => {
        await scraper.autoScroll(mockPage, 2000, signal);
      }).rejects.toThrow('操作被取消');
    });
  });
  
  // 测试 downloadImage 方法
  describe('downloadImage方法', () => {
    it('应该成功下载图片', async () => {
      const success = await scraper.downloadImage('https://i.pinimg.com/originals/test.jpg', '/tmp/test.jpg', null);
      expect(success).toBe(true);
      expect(global.fetch.called).toBe(true);
    });
    
    it('应该处理响应错误', async () => {
      global.fetch = sandbox.stub().resolves({
        ok: false,
        status: 404
      });
      
      const success = await scraper.downloadImage('https://example.com/error.jpg', '/tmp/error.jpg', null);
      expect(success).toBe(false);
    });
    
    it('应该处理网络错误', async () => {
      global.fetch = sandbox.stub().rejects(new Error('网络错误'));
      
      const success = await scraper.downloadImage('https://example.com/network-error.jpg', '/tmp/network-error.jpg', null);
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
    
    it('应该处理写入错误', async () => {
      // 先恢复之前的桩函数，然后重新设置
      sandbox.restore();
      sandbox = sinon.createSandbox();
      
      // 模拟其他必要的依赖
      sandbox.stub(puppeteer, 'launch').resolves({
        newPage: sinon.stub().resolves({
          setViewport: sinon.stub().resolves(undefined),
          evaluate: sinon.stub().resolves(undefined)
        }),
        close: sinon.stub().resolves(undefined)
      });
      
      // 重新设置fs模拟
      sandbox.stub(fs, 'existsSync').returns(true);
      sandbox.stub(fs, 'mkdirSync');
      sandbox.stub(fs, 'writeFileSync').throws(new Error('写入错误'));
      
      // 设置fetch模拟
      global.fetch = sandbox.stub().resolves({
        ok: true,
        status: 200,
        arrayBuffer: () => Promise.resolve(Buffer.from('测试图片数据').buffer)
      });
      
      const success = await scraper.downloadImage('https://example.com/write-error.jpg', '/tmp/write-error.jpg', null);
      expect(success).toBe(false);
    });
  });
  
  // 测试 transformImageUrl 方法
  describe('transformImageUrl方法', () => {
    it('应该转换缩略图URL为原图URL', () => {
      expect(scraper.transformImageUrl('https://i.pinimg.com/236x/ab/cd/ef.jpg'))
        .toBe('https://i.pinimg.com/originals/ab/cd/ef.jpg');
      
      expect(scraper.transformImageUrl('https://i.pinimg.com/474x/ab/cd/ef.jpg'))
        .toBe('https://i.pinimg.com/originals/ab/cd/ef.jpg');
        
      expect(scraper.transformImageUrl('https://i.pinimg.com/60x60/ab/cd/ef.jpg'))
        .toBe('https://i.pinimg.com/originals/ab/cd/ef.jpg');
        
      expect(scraper.transformImageUrl('https://i.pinimg.com/736x/ab/cd/ef.jpg'))
        .toBe('https://i.pinimg.com/originals/ab/cd/ef.jpg');
    });
    
    it('应该处理自定义尺寸格式', () => {
      expect(scraper.transformImageUrl('https://i.pinimg.com/123x456/ab/cd/ef.jpg'))
        .toBe('https://i.pinimg.com/originals/ab/cd/ef.jpg');
    });
    
    it('应该保持非缩略图URL不变', () => {
      const origUrl = 'https://example.com/image.jpg';
      expect(scraper.transformImageUrl(origUrl)).toBe(origUrl);
    });
    
    it('应该处理空URL', () => {
      expect(scraper.transformImageUrl(null)).toBeNull();
      expect(scraper.transformImageUrl(undefined)).toBeUndefined();
      expect(scraper.transformImageUrl('')).toBe('');
    });
  });
}); 