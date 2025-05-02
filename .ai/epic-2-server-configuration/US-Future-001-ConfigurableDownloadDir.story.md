# Epic-2 - Story-1

可配置的下载目录

**作为** 服务器管理员，
**我想要** 通过设置一个环境变量 (`MCP_PINTEREST_DOWNLOAD_DIR`) 来指定 Pinterest MCP 服务器下载所有图片的根目录，
**以便** 统一管理服务器的下载文件位置，并确保文件保存在预期的、安全的存储区域。

## Status

Completed

## Context

{
- **Background:** 当前服务器将所有下载的图片硬编码保存在 `../downloads` 目录下。
- **Current state:** 需要一种方法来配置下载目录，而不是使用硬编码路径。
- **Story justification:** 允许管理员根据服务器环境和存储策略灵活指定下载位置，提高安全性和可管理性。
- **Technical context:** 需要修改服务器启动逻辑和下载处理逻辑以读取和使用环境变量。
- **Business drivers:** 统一文件管理，满足不同部署环境下的存储需求。
- **Relevant history:** N/A
}

## Estimation

Story Points: 3

## Tasks

{
1.  - [x] **环境变量处理:**
    1.  - [x] 服务器启动时检查 `MCP_PINTEREST_DOWNLOAD_DIR` 环境变量。
    2.  - [x] 如果设置了环境变量：
        1.  - [x] 验证路径是否存在，不存在则尝试创建（包括父目录）。
        2.  - [x] 验证服务器进程对路径的写入权限。
        3.  - [x] 如果验证失败（无法创建或无权限），记录严重错误并退出（或按策略降级）。
    3.  - [x] 如果未设置环境变量，确认使用默认路径 `../downloads`。
2.  - [x] **下载逻辑修改:**
    1.  - [x] 更新 `pinterest_search_and_download` 及其他下载工具，使其使用确定的下载路径（环境变量指定或默认）。
    2.  - [x] 确认客户端调用下载工具时不再允许通过参数指定下载路径。
3.  - [x] **文档更新:**
    1.  - [x] 在服务器文档中清晰说明 `MCP_PINTEREST_DOWNLOAD_DIR` 环境变量及其行为。
}

## Constraints

- 环境变量优先级高于默认路径
- 目录创建失败时立即退出程序，确保数据安全

## Data Models / Schema

- N/A

## Structure

- 修改了 `pinterest-mcp-server.ts` 文件，添加了环境变量检查和目录验证逻辑
- 更新了下载相关功能，使其使用统一配置的下载目录

## Diagrams

- N/A

## Dev Notes

- 实现方式：通过服务器环境变量 `MCP_PINTEREST_DOWNLOAD_DIR` 实现。
- 优先级：高。
- 已考虑不同操作系统下的路径表示和权限问题。
- 错误处理：路径验证失败时会记录错误并退出程序。

## Chat Command Log

- N/A 