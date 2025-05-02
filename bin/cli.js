#!/usr/bin/env node

/**
 * CLI 脚本，用于通过 npx 启动 Pinterest MCP 服务器
 */

// 解析命令行参数
const args = process.argv.slice(2);
const options = {};

// 简单的参数解析
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2);
    const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
    options[key] = value;
    if (value !== true) i++;
  }
}

// 设置端口，默认3000或从参数获取
const port = options.port || process.env.PORT || 3000;

console.log('🚀 正在启动 MCP Pinterest 服务器...');
console.log('📋 服务器选项:', options);

// 设置环境变量
if (options.downloadDir) {
  process.env.MCP_PINTEREST_DOWNLOAD_DIR = options.downloadDir;
}

if (options.filenameTemplate) {
  process.env.MCP_PINTEREST_FILENAME_TEMPLATE = options.filenameTemplate;
}

// 直接导入并运行服务器
import('../dist/pinterest-mcp-server.js')
  .then(() => {
    console.log(`✅ 服务器已在端口 ${port} 成功启动`);
    console.log(`🔗 访问: http://localhost:${port}`);
  })
  .catch(error => {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }); 