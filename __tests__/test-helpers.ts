/**
 * 测试辅助工具
 * 提供测试中常用的模拟和工具函数
 */

import { jest, describe, expect, test } from '@jest/globals';

/**
 * Pinterest搜索结果类型
 */
export interface PinterestResult {
  title: string;
  image_url: string;
  link: string;
  source: string;
}

/**
 * 创建模拟的 Pinterest 搜索结果
 * @param count 结果数量
 * @returns 模拟的搜索结果数组
 */
export function createMockPinterestResults(count: number = 5): PinterestResult[] {
  const results: PinterestResult[] = [];
  for (let i = 1; i <= count; i++) {
    results.push({
      title: `Test Image ${i}`,
      image_url: `https://i.pinimg.com/originals/test${i}.jpg`,
      link: `https://pinterest.com/pin/${i}`,
      source: 'pinterest'
    });
  }
  return results;
}

/**
 * 模拟 Axios 响应
 * @param content 响应内容
 * @param contentType 内容类型
 * @returns 模拟的 Axios 响应对象
 */
export function mockAxiosResponse(content: any = 'mock-data', contentType: string = 'image/jpeg'): any {
  return {
    data: typeof content === 'string' ? Buffer.from(content) : content,
    headers: {
      'content-type': contentType
    }
  };
}

/**
 * 创建模拟的文件系统
 * @returns 模拟的 fs 对象
 */
export function createMockFileSystem(): any {
  return {
    promises: {
      mkdir: jest.fn().mockResolvedValue(undefined),
      writeFile: jest.fn().mockResolvedValue(undefined),
      access: jest.fn().mockImplementation((path: string) => {
        if (path.includes('exists')) {
          return Promise.resolve();
        } else {
          return Promise.reject(new Error('File not exists'));
        }
      })
    },
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn()
  };
}

/**
 * 创建模拟的 Puppeteer 浏览器
 * @param evaluateResults 浏览器评估返回的结果
 * @returns 模拟的 puppeteer 对象
 */
export function createMockPuppeteer(evaluateResults: PinterestResult[] = []): any {
  const mockPage = {
    setViewport: jest.fn().mockResolvedValue(undefined),
    setUserAgent: jest.fn().mockResolvedValue(undefined),
    setDefaultNavigationTimeout: jest.fn(),
    setDefaultTimeout: jest.fn(),
    setRequestInterception: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    goto: jest.fn().mockResolvedValue(undefined),
    waitForSelector: jest.fn().mockResolvedValue(undefined),
    evaluate: jest.fn().mockResolvedValue(evaluateResults.length ? evaluateResults : createMockPinterestResults()),
    close: jest.fn().mockResolvedValue(undefined)
  };

  const mockBrowser = {
    newPage: jest.fn().mockResolvedValue(mockPage),
    close: jest.fn().mockResolvedValue(undefined)
  };

  return {
    launch: jest.fn().mockResolvedValue(mockBrowser),
    mockPage,
    mockBrowser
  };
}

/**
 * 等待一段时间
 * @param ms 等待的毫秒数
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 断言函数被调用的次数
 * @param mockFn 模拟函数
 * @param count 预期的调用次数
 */
export function assertCallCount(mockFn: jest.Mock, count: number): void {
  expect(mockFn.mock.calls.length).toBe(count);
}

/**
 * 清除所有模拟
 */
export function resetAllMocks(): void {
  jest.clearAllMocks();
  jest.resetAllMocks();
}

// Test suite for the helpers
describe('测试辅助工具', () => {
  test('createMockPinterestResults 应该创建正确数量的结果', () => {
    const results = createMockPinterestResults(3);
    expect(results).toHaveLength(3);
    expect(results[0].title).toBe('Test Image 1');
    expect(results[0].image_url).toBe('https://i.pinimg.com/originals/test1.jpg');
  });
}); 