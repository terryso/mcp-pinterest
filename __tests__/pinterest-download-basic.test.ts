import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { downloadImage } from '../src/pinterest-download.js';

// 模拟依赖
jest.mock('axios');
jest.mock('fs');
jest.mock('path');

describe('Pinterest 下载功能 - 基本测试', () => {
  beforeEach(() => {
    // 清除所有模拟
    jest.clearAllMocks();
    
    // 设置模拟
    jest.spyOn(axios, 'get').mockResolvedValue({
      data: Buffer.from('mock image data')
    });
    
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs.promises, 'mkdir').mockResolvedValue(undefined);
    jest.spyOn(fs.promises, 'writeFile').mockResolvedValue(undefined);
    jest.spyOn(path, 'join').mockReturnValue('/test/path/image.jpg');
  });
  
  test('能够正确调用axios.get和fs函数', async () => {
    // 测试数据
    const mockResult = {
      id: '123456789',
      image_url: 'https://example.com/image.jpg'
    };
    
    // 执行测试
    const result = await downloadImage(mockResult, '/test/dir');
    
    // 验证结果
    expect(result).toEqual({
      success: true,
      id: '123456789',
      path: '/test/path/image.jpg',
      url: 'https://example.com/image.jpg'
    });
    
    // 验证调用
    expect(axios.get).toHaveBeenCalledWith('https://example.com/image.jpg', { responseType: 'arraybuffer' });
    expect(fs.promises.writeFile).toHaveBeenCalled();
  });
}); 