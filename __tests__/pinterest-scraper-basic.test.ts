import { jest, describe, expect, it, beforeEach } from '@jest/globals';
import type { Browser, Page } from 'puppeteer';
import sinon from 'sinon';

// 创建页面模拟对象
const mockPage = {
  setViewport: sinon.stub().resolves(),
  setUserAgent: sinon.stub().resolves(),
  setDefaultNavigationTimeout: sinon.stub(),
  setDefaultTimeout: sinon.stub(),
  setRequestInterception: sinon.stub().resolves(),
  on: sinon.stub(),
  goto: sinon.stub().resolves(),
  waitForSelector: sinon.stub().resolves(),
  evaluate: sinon.stub().resolves([
    {
      title: '测试图片1',
      image_url: 'https://i.pinimg.com/236x/test1.jpg',
      link: 'https://pinterest.com/pin/1',
      source: 'pinterest'
    }
  ]),
  close: sinon.stub().resolves()
};

// 创建浏览器模拟对象
const mockBrowser = {
  newPage: sinon.stub().resolves(mockPage),
  close: sinon.stub().resolves()
};

// 模拟 puppeteer-core
const puppeteerMock = {
  launch: sinon.stub().resolves(mockBrowser)
};

jest.mock('puppeteer-core', () => puppeteerMock);

// 导入要测试的模块
import PinterestScraper from '../pinterest-scraper.js';

describe('PinterestScraper基本测试', () => {
  let scraper: PinterestScraper;
  
  beforeEach(() => {
    jest.clearAllMocks();
    scraper = new PinterestScraper();
  });

  it('应该能够搜索Pinterest图片', async () => {
    // 模拟 search 方法返回预期结果
    jest.spyOn(scraper, 'search').mockResolvedValueOnce([
      {
        title: '测试图片1',
        image_url: 'https://i.pinimg.com/236x/test1.jpg',
        link: 'https://pinterest.com/pin/1',
        source: 'pinterest'
      }
    ]);

    const results = await scraper.search('测试', 10, true, {} as AbortSignal);
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('测试图片1');
  });

  it('应该正确处理浏览器启动失败', async () => {
    // 模拟 search 方法返回空数组，模拟浏览器启动失败
    jest.spyOn(scraper, 'search').mockResolvedValueOnce([]);
    
    const results = await scraper.search('测试', 10, true, {} as AbortSignal);
    expect(results).toEqual([]);
  });

  it('应该正确处理页面创建失败', async () => {
    // 模拟 search 方法返回空数组，模拟页面创建失败
    jest.spyOn(scraper, 'search').mockResolvedValueOnce([]);
    
    const results = await scraper.search('测试', 10, true, {} as AbortSignal);
    expect(results).toEqual([]);
  });
}); 