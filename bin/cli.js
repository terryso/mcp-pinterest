#!/usr/bin/env node

/**
 * CLI entry for `npx pinterest-mcp-server` and the global bin.
 * MCP JSON-RPC owns stdout, so every log from this process goes to stderr.
 */

const writeToStderr = console.error.bind(console);
console.log = writeToStderr;
console.info = writeToStderr;
console.debug = writeToStderr;

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

if (options.port) {
  console.error('Ignoring --port: this MCP server speaks stdio and does not listen on a TCP port.');
}

// 设置环境变量
if (options.downloadDir && options.downloadDir !== true) {
  process.env.MCP_PINTEREST_DOWNLOAD_DIR = options.downloadDir;
}

if (options.filenameTemplate && options.filenameTemplate !== true) {
  process.env.MCP_PINTEREST_FILENAME_TEMPLATE = options.filenameTemplate;
}

if (options.proxyServer && options.proxyServer !== true) {
  process.env.MCP_PINTEREST_PROXY_SERVER = options.proxyServer;
  console.error('Using proxy from --proxyServer');
}

console.error('Starting Pinterest MCP server on stdio');

// 直接导入并运行服务器
import('../dist/pinterest-mcp-server.js')
  .catch(error => {
    console.error('服务器启动失败:', error);
    process.exit(1);
  });
