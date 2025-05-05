# Epic-N - Story-US-Future-004

从 Pin URL 下载图片

**As a** MCP 客户端
**I want** 提供一个 Pinterest Pin 页面的 URL，并指定一个数量 N，让服务器从该页面抓取并下载最多 N 张相关的图片
**so that** 我可以快速获取与特定 Pin 相关的视觉内容

## Status

Approved

## Context

{

- **Background information:** 用户请求新增功能，允许通过 Pinterest Pin URL 直接触发图片下载。
- **Current state:** 当前服务器支持通过关键词搜索下载 (`pinterest_search_and_download`)。
- **Story justification:** 提供更直接的方式来获取与已知 Pin 相关联的图片。
- **Technical context:** 需要实现对 Pinterest Pin 页面的抓取 (scraping) 来提取图片链接。将复用现有的图片下载逻辑和配置（下载目录、文件名模板）。
- **Business drivers:** 提高用户获取特定 Pinterest 内容的效率。
- **Relevant history:** 补充现有的 `pinterest_search`, `pinterest_get_image_info`, `pinterest_search_and_download` 功能。
  }

## Estimation

Story Points: {TBD}

## Tasks

{

1.  - [ ] **实现 MCP Tool `pinterest_download_from_pin_url`**
    1.  - [ ] 定义 Tool 的输入参数 (`pin_url`, `limit`) 和输出格式 (成功消息/错误信息)。
    2.  - [ ] 在 `pinterest-mcp-server.ts` 中注册并实现该 Tool 的基本处理逻辑。
2.  - [ ] **实现 Pin URL 解析和图片提取**
    1.  - [ ] 验证输入的 `pin_url` 格式是否有效。
    2.  - [ ] 使用爬虫库 (如 `axios`, `cheerio` 或 `puppeteer-core`) 访问 `pin_url`。
    3.  - [ ] 分析 Pin 页面的 HTML 结构，提取主图片和相关图片的 URL。
    4.  - [ ] 处理页面加载失败、结构变更或无法提取图片等错误情况。
    5.  - [ ] 限制提取图片的数量不超过 `limit`。
3.  - [ ] **集成下载逻辑**
    1.  - [ ] 将提取到的图片 URL 列表传递给现有的下载模块。
    2.  - [ ] 复用 `MCP_PINTEREST_DOWNLOAD_DIR` 和 `MCP_PINTEREST_FILENAME_TEMPLATE` 环境变量或默认值来确定下载路径和文件名。
    3.  - [ ] 处理下载过程中的错误（网络、磁盘权限/空间等）。
4.  - [ ] **添加测试**
    1.  - [ ] 编写单元测试验证 URL 解析、图片提取逻辑。
    2.  - [ ] 编写集成测试模拟 Tool 调用，覆盖成功和失败场景。
5.  - [ ] **更新文档**
    1.  - [ ] (如果需要) 更新 `README.md` 或其他相关文档说明新 Tool 的用法。

- Use - [x] for completed items
- Use ~~skipped/cancelled items~~
  }

## Constraints

- **依赖外部页面结构:** 功能的稳定性依赖于 Pinterest Pin 页面的 HTML 结构，如果 Pinterest 更新页面，可能导致抓取失败。
- **服务器端配置:** 下载目录和文件名格式由服务器环境变量控制，客户端无法指定。
- **无认证:** 仅能访问公开的 Pin 页面和图片。
- **速率限制:** 未明确处理 Pinterest 可能存在的访问频率限制。

## Data Models / Schema

**Tool:** `pinterest_download_from_pin_url`

**Input:**
```json
{
  "pin_url": "string", // (必需) Pinterest Pin 页面的完整 URL
  "limit": "integer"   // (可选) 最多需要下载的图片数量
}
```

**Output (Success):**
```json
{
  "message": "string" // 例如: "成功从 URL 下载 X 张图片"
}
```

**Output (Failure):**
```json
{
  "error": "string" // 描述错误的具体信息
}
```

## Structure

- **`pinterest-mcp-server.ts`**: 添加新的 `pinterest_download_from_pin_url` Tool 处理逻辑。
- **`pinterest-scraper.js` (或新模块)**: 可能需要扩展或创建新函数来处理 Pin 页面的抓取和图片 URL 提取。
- **`src/pinterest-download.js` (假设)**: 复用现有的下载函数。

## Diagrams

```mermaid
sequenceDiagram
    participant Client as MCP Client
    participant Server as MCP Server
    participant Scraper as Pinterest Scraper Module
    participant Downloader as Download Module

    Client->>+Server: Call pinterest_download_from_pin_url(pin_url, limit)
    Server->>+Scraper: extractImagesFromPin(pin_url, limit)
    Scraper-->>-Server: List<image_url> or Error
    alt 图片提取成功
        Server->>+Downloader: downloadImages(image_urls)
        Downloader-->>-Server: Download Results (Success/Failures)
        Server-->>-Client: Success Message (e.g., "Downloaded X images")
    else 图片提取失败或下载失败
        Server-->>-Client: Error Message
    end
```

## Dev Notes

- 页面抓取逻辑需要健壮，能应对 Pinterest 前端可能的细微变化。考虑使用更稳定的选择器，并添加详细的错误日志。
- 明确 `limit` 参数的默认值（如果未提供）。
- 考虑对提取到的图片 URL 进行去重。
- 确保错误信息清晰，能帮助客户端诊断问题。

## Chat Command Log

- User: 我现在要新增一个功能，请帮我更新到@prd.md 中...希望能直接下载指定pin地址...的N张图片
- Agent: ...请问您的意思是：1. 只下载该 URL 对应的那张主要图片吗？ 2. 还是希望...抓取并下载多张相关的图片...？
- User: 按照选项 2 做
- Agent: 好的，明白了...我将在 `.ai/prd.md` ... 添加一个新的用户故事...
- (Agent updates prd.md)
- User: 这个用户故事已经反映了我的需求，请生成对应的用户故事文档...
- (Agent generates this story file) 