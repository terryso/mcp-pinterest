/**
 * Pinterest 爬虫基本测试
 */
import { jest, describe, expect, test, beforeEach } from '@jest/globals';
import PinterestScraper from '../pinterest-scraper.js';

// 替换 puppeteer 的 mock 为 puppeteer-core
jest.mock('puppeteer-core', () => ({
  launch: jest.fn().mockImplementation(() => Promise.resolve({
    newPage: jest.fn().mockImplementation(() => Promise.resolve({
      setViewport: jest.fn().mockImplementation(() => Promise.resolve()),
      setUserAgent: jest.fn().mockImplementation(() => Promise.resolve()),
      goto: jest.fn().mockImplementation(() => Promise.resolve()),
      waitForSelector: jest.fn().mockImplementation(() => Promise.resolve()),
      evaluate: jest.fn().mockImplementation(() => Promise.resolve([
        {
          title: '测试图片1',
          image_url: 'https://i.pinimg.com/236x/test1.jpg',
          link: 'https://pinterest.com/pin/1',
          source: 'pinterest'
        }
      ])),
      close: jest.fn().mockImplementation(() => Promise.resolve())
    })),
    close: jest.fn().mockImplementation(() => Promise.resolve())
  }))
}));

// 简单测试
describe('PinterestScraper 基本功能', () => {
  let scraper;
  
  beforeEach(() => {
    scraper = new PinterestScraper();
  });
  
  test('应该能够实例化爬虫', () => {
    expect(scraper).toBeDefined();
    expect(typeof scraper.search).toBe('function');
  });
}); 