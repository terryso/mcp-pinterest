import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { downloadImage } from '../src/pinterest-download.js';

// 在测试中缓存原始模块
const originalFs = { ...fs };
const originalPath = { ...path };

// 不要在这里模拟axios，而是在每个测试中单独模拟

describe('Pinterest Download Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 模拟fs.existsSync
    jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
    
    // 模拟fs.promises.mkdir
    jest.spyOn(fs.promises, 'mkdir').mockImplementation(() => Promise.resolve());
    
    // 模拟fs.promises.writeFile
    jest.spyOn(fs.promises, 'writeFile').mockImplementation(() => Promise.resolve());
    
    // 模拟path.join
    jest.spyOn(path, 'join').mockImplementation((...args) => args.join('/'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('下载单个Pinterest图片', async () => {
    // 在每个测试内部模拟axios
    jest.spyOn(axios, 'get').mockImplementation(() => 
      Promise.resolve({ data: Buffer.from('mock image data') })
    );
    
    // 设置目录已存在
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    
    // 准备测试数据
    const mockPinterestResult = {
      id: '123456789',
      image_url: 'https://example.com/image.jpg'
    };
    const downloadDir = '/test/download/dir';
    
    // 执行被测试的函数
    await downloadImage(mockPinterestResult, downloadDir);
    
    // 验证： 确认axios.get被正确调用
    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/image.jpg',
      { responseType: 'arraybuffer' }
    );
    
    // 验证： 确认fs.writeFile被正确调用
    expect(fs.promises.writeFile).toHaveBeenCalled();
  });

  test('如果下载目录不存在，则创建该目录', async () => {
    // 在每个测试内部模拟axios
    jest.spyOn(axios, 'get').mockImplementation(() => 
      Promise.resolve({ data: Buffer.from('mock image data') })
    );
    
    // 设置目录不存在
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    
    // 准备测试数据
    const mockPinterestResult = {
      id: '123456789',
      image_url: 'https://example.com/image.jpg'
    };
    const downloadDir = '/test/download/dir';
    
    // 执行被测试的函数
    await downloadImage(mockPinterestResult, downloadDir);
    
    // 验证： 确认目录创建函数被调用
    expect(fs.promises.mkdir).toHaveBeenCalledWith(downloadDir, { recursive: true });
    
    // 验证： 确认文件写入函数被调用
    expect(fs.promises.writeFile).toHaveBeenCalled();
  });
}); 