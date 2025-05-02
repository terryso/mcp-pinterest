import { PinterestMcpServer } from '../pinterest-mcp-server.js';

/**
 * 启动 Pinterest MCP 服务器
 * @param options 服务器配置选项
 * @returns Promise 对象，服务器启动成功时解析
 */
export async function startServer(options = {}) {
  // 实例化 Pinterest MCP 服务器
  const server = new PinterestMcpServer();
  
  // 设置选项
  if (options) {
    // 处理传入的选项
    // 例如: 可以设置端口、下载目录等
    process.env.MCP_PINTEREST_DOWNLOAD_DIR = options.downloadDir || process.env.MCP_PINTEREST_DOWNLOAD_DIR;
    process.env.MCP_PINTEREST_FILENAME_TEMPLATE = options.filenameTemplate || process.env.MCP_PINTEREST_FILENAME_TEMPLATE;
  }
  
  // 启动服务器
  return server.run();
}

// 如果直接执行这个文件，则启动服务器
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer()
    .then(() => console.log('服务器已启动'))
    .catch(err => {
      console.error('服务器启动失败:', err);
      process.exit(1);
    });
} 