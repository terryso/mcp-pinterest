import { jest } from '@jest/globals';
import type { Page, Browser, BrowserContext } from 'puppeteer-core';
import { describe, it, expect } from '@jest/globals';

// 定义类型
interface PinterestResult {
  title: string;
  image_url: string;
  link: string;
}

// 创建模拟页面对象
const mockPage = {
  setViewport: jest.fn(() => Promise.resolve()),
  setUserAgent: jest.fn(() => Promise.resolve()),
  setDefaultNavigationTimeout: jest.fn(),
  setDefaultTimeout: jest.fn(),
  setRequestInterception: jest.fn(() => Promise.resolve()),
  on: jest.fn(),
  removeAllListeners: jest.fn(),
  goto: jest.fn(() => Promise.resolve()),
  waitForSelector: jest.fn(() => Promise.resolve()),
  evaluate: jest.fn(() => Promise.resolve([
    { title: '测试图片1', image_url: 'https://i.pinimg.com/236x/test1.jpg', link: 'https://pinterest.com/pin/1' },
    { title: '测试图片2', image_url: 'https://i.pinimg.com/236x/test2.jpg', link: 'https://pinterest.com/pin/2' }
  ] as PinterestResult[])),
  close: jest.fn(() => Promise.resolve()),
  browser: jest.fn(() => mockBrowser),
  browserContext: jest.fn(() => ({} as BrowserContext)),
  target: jest.fn(),
  workers: jest.fn(() => []),
  mainFrame: jest.fn(),
  frames: jest.fn(() => []),
  isClosed: jest.fn(() => false)
} as unknown as jest.Mocked<Page>;

// 创建模拟浏览器对象
const mockBrowser = {
  newPage: jest.fn(() => Promise.resolve(mockPage)),
  close: jest.fn(() => {
    // 确保在关闭时清理所有资源
    const proc = mockBrowser.process();
    if (proc && typeof proc.kill === 'function') {
      proc.kill();
    }
    return Promise.resolve();
  }),
  createIncognitoBrowserContext: jest.fn(() => Promise.resolve({} as BrowserContext)),
  browserContexts: jest.fn(() => []),
  defaultBrowserContext: jest.fn(() => ({} as BrowserContext)),
  pages: jest.fn(() => Promise.resolve([])),
  target: jest.fn(),
  targets: jest.fn(() => []),
  wsEndpoint: jest.fn(() => ''),
  version: jest.fn(() => Promise.resolve('')),
  process: jest.fn(() => ({
    kill: jest.fn(() => true),
    pid: 12345
  })),
  isConnected: jest.fn(() => true)
} as unknown as jest.Mocked<Browser>;

// 模拟puppeteer-core
jest.mock('puppeteer-core', () => ({
  __esModule: true,
  default: {
    launch: jest.fn(() => {
      const killMockProcess = jest.fn();
      const mockProcess = {
        kill: killMockProcess,
        pid: 12345
      };
      
      return Promise.resolve({
        ...mockBrowser,
        process: () => mockProcess,
        close: jest.fn(async () => {
          killMockProcess();
          return Promise.resolve();
        })
      });
    })
  }
}));

// 模拟文件系统模块
const mockFs = {
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn()
};

jest.mock('fs', () => mockFs);

// 模拟path模块
const mockPath = {
  join: jest.fn()
};

jest.mock('path', () => mockPath);

// 设置更长的默认超时时间
jest.setTimeout(120000);

// 在每次测试后清理所有模拟和进程
afterEach(() => {
  jest.clearAllMocks();
  // 确保调用浏览器的close方法来清理资源
  mockBrowser.close();
});

// 导出模拟对象供测试使用
export { mockFs, mockPath, mockPage, mockBrowser };

// Jest全局设置文件

// 设置测试超时时间为30秒
jest.setTimeout(30000);

// 设置测试环境变量
process.env.NODE_ENV = 'test';

// 添加一个基本的测试以避免"没有测试"的警告
describe('Jest设置', () => {
  it('应该正确设置测试环境', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});

// 导出一个空对象以避免"没有测试"的警告
export default {}; 