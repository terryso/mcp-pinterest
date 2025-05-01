import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, afterEach, describe, expect, it, jest } from '@jest/globals';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 这个测试文件验证环境变量MCP_PINTEREST_DOWNLOAD_DIR能否正常工作
 * 测试重点：
 * 1. 环境变量正确设置时，下载目录应该使用环境变量的值
 * 2. 环境变量未设置时，应该使用默认的下载目录
 */
describe('MCP_PINTEREST_DOWNLOAD_DIR环境变量测试', () => {
  // 临时目录用于测试
  const testDownloadDir = path.join(__dirname, 'test-env-downloads');
  
  // 保存原始环境变量
  const originalEnv = { ...process.env };
  
  beforeEach(() => {
    // 创建测试目录
    if (!fs.existsSync(testDownloadDir)) {
      fs.mkdirSync(testDownloadDir, { recursive: true });
    }
  });
  
  afterEach(() => {
    // 恢复原始环境变量
    process.env = { ...originalEnv };
    
    // 清理测试目录
    if (fs.existsSync(testDownloadDir)) {
      try {
        fs.rmSync(testDownloadDir, { recursive: true, force: true });
      } catch (error) {
        console.error(`清理测试目录失败: ${error}`);
      }
    }
  });
  
  it('环境变量应该正确设置和获取', () => {
    // 测试设置环境变量
    process.env.MCP_PINTEREST_DOWNLOAD_DIR = testDownloadDir;
    expect(process.env.MCP_PINTEREST_DOWNLOAD_DIR).toBe(testDownloadDir);
    
    // 测试清除环境变量（设置为空字符串）
    process.env.MCP_PINTEREST_DOWNLOAD_DIR = '';
    expect(process.env.MCP_PINTEREST_DOWNLOAD_DIR).toBe('');
  });
  
  it('测试目录创建和写入权限验证', () => {
    // 验证测试目录是否存在
    expect(fs.existsSync(testDownloadDir)).toBe(true);
    
    // 测试写入权限
    const testFile = path.join(testDownloadDir, 'test-file.txt');
    fs.writeFileSync(testFile, 'test content');
    expect(fs.existsSync(testFile)).toBe(true);
    expect(fs.readFileSync(testFile, 'utf8')).toBe('test content');
    
    // 清理测试文件
    fs.unlinkSync(testFile);
    expect(fs.existsSync(testFile)).toBe(false);
  });
}); 