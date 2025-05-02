# 1. Title: PRD for Pinterest MCP Server

<version>0.1.0</version>

## Status: Approved

## Intro

本项目旨在开发一个遵循模型上下文协议 (Model Context Protocol, MCP) 的服务器。该服务器的核心功能是提供与 Pinterest 平台交互的能力，允许 MCP 客户端（如 IDE、AI 助手等）通过标准化的接口搜索 Pinterest 图片，获取图片信息，并将图片下载到指定位置。目的是为了方便将 Pinterest 的内容集成到各种支持 MCP 的工具和应用中。

## Goals

{
- **Clear project objectives:** 实现一个功能性的 MCP 服务器，提供 Pinterest 图片搜索和下载服务。
- **Measurable outcomes:** 成功处理 MCP 客户端的 `pinterest_search`, `pinterest_get_image_info`, `pinterest_search_and_download` 请求，并返回预期结果或明确错误。
- **Success criteria:** 服务器稳定运行，能够根据关键词找到相关图片，获取图片信息，并成功下载图片到预定位置。
- **Key performance indicators (KPIs):** (待定，例如：请求成功率、平均响应时间)
}

## Features and Requirements

{
- **Functional requirements:**
    - 实现基于 MCP 的服务器。
    - 提供 `pinterest_search` Tool，根据关键词搜索图片。
    - 提供 `pinterest_get_image_info` Tool，根据图片 ID 获取详细信息。
    - 提供 `pinterest_search_and_download` Tool，根据关键词搜索并下载图片。
    - 图片下载到固定的服务器端目录 (`../downloads`)。
    - 文件名使用固定格式 (`pinterest_{imageId}.{fileExtension}`)。
- **Non-functional requirements:**
    - 服务器应能处理并发请求（具体并发数待定）。
    - 提供明确的错误信息给客户端。
    - (未来) 可配置性：下载目录和文件名模板可通过环境变量配置。
- **User experience requirements:** (主要针对客户端开发者) API 接口清晰，易于使用。
- **Integration requirements:** 遵循 MCP 协议规范。
- **Compliance requirements:** (待定，例如：是否需要遵守 Pinterest API 使用条款)
}

## Epic List

### Epic-1: MVP Core Functionality (v0.1)

此 Epic 包含了实现 Pinterest MCP 服务器基本搜索和下载功能的初始用户故事。

### Epic-2: Server Configuration Enhancements

此 Epic 专注于提高服务器的可配置性，例如下载目录和文件名。

### Epic-N: Future Enhancements (Beyond Scope of v0.1/v0.2)

包括 Pinterest 认证、更丰富的搜索、下载前确认、异步处理等未来可能的功能。

## Epic 1: MVP Core Functionality - Story List

- **Story US-001: Implement `pinterest_search` Tool**
  Status: 'Complete'
  Requirements:
  - 接收 `keyword` (必需) 和 `limit` (可选) 参数。
  - 调用 Pinterest API (或相应库) 执行搜索。
  - 返回图片 ID 列表或错误信息。

- **Story US-002: Implement `pinterest_get_image_info` Tool**
  Status: 'Complete'
  Requirements:
  - 接收 `image_id` (必需) 参数。
  - 调用 Pinterest API (或相应库) 获取图片详情。
  - 返回 `image_url`, `source`, `timestamp` 或错误信息。

- **Story US-003: Implement `pinterest_search_and_download` Tool**
  Status: 'Complete'
  Requirements:
  - 接收 `keyword` (必需) 和 `limit` (可选) 参数。
  - 执行搜索。
  - 对结果中的图片进行下载。
  - 下载到硬编码路径 `../downloads`。
  - 文件名使用硬编码格式 `pinterest_{imageId}.{fileExtension}`。
  - 返回成功消息或错误信息。

## Epic 2: Server Configuration Enhancements - Story List

- **Story US-Future-001: Configurable Download Directory**
  Status: 'Draft'
  Requirements:
  - 通过 `MCP_PINTEREST_DOWNLOAD_DIR` 环境变量配置下载根目录。
  - 未设置则使用默认 `../downloads`。
  - 启动时验证路径有效性和写入权限。
  - 客户端无法指定路径。

- **Story US-Future-002: Custom Filename Template**
  Status: 'Draft'
  Requirements:
  - 通过 `MCP_PINTEREST_FILENAME_TEMPLATE` 环境变量配置全局文件名模板。
  - 未设置则使用默认 `pinterest_{imageId}.{fileExtension}`。
  - 支持 `{imageId}`, `{fileExtension}`, `{timestamp}`, `{index}` 变量。
  - 验证模板有效性，清理非法字符，无效则回退默认模板。
  - 客户端无法指定模板。

## Technology Stack

| Technology                | Description                                                 |
| ------------------------- | ----------------------------------------------------------- |
| Language                  | TypeScript                                                  |
| Runtime                   | Node.js                                                     |
| MCP SDK                   | `@modelcontextprotocol/sdk`                                 |
| Pinterest Interaction     | `@myno_21/pinterest-scraper` ( 主要库), `axios`, `cheerio`, `puppeteer-core` (可能为辅助或依赖) |
| Testing                   | Jest, ts-jest, Sinon                                        |
| Development Environment   | ts-node-dev, Babel                                          |
| Package Manager           | npm (implied by package.json/package-lock.json)             |
| Containerization          | Docker (implied by Dockerfile)                              |

## Reference

- **内部文档:**
    - [架构文档](./architecture.md): 详细描述了系统组件、数据流和部署。
- **核心库:**
    - Model Context Protocol SDK: `@modelcontextprotocol/sdk`
    - Pinterest Scraper: `@myno_21/pinterest-scraper`

## Data Models, API Specs, Schemas, etc...

(当前版本主要是 Tool 的输入输出定义，已在用户故事中描述)

## Project Structure

(基于 architecture.md 描述的主要组件)

```text
.
├── pinterest-mcp-server.ts  # MCP 服务器接口, 工具处理
├── pinterest-scraper.js     # Pinterest 爬虫模块
├── src/
│   └── pinterest-download.js  # 下载模块 (根据架构文档，实际可能为 .js)
├── dist/                    # 编译后的 JS 文件
├── downloads/               # 默认图片下载目录
├── tests/                   # 测试文件
├── .ai/                     # PRD, 用户故事, 架构文档等
│   ├── prd.md
│   ├── architecture.md
│   └── ... (用户故事文件)
├── node_modules/
├── package.json
├── tsconfig.json
├── Dockerfile
└── ... (其他配置文件如 .env, jest.config, etc.)
```

## Change Log

| Change        | Story ID | Description       |
| ------------- | -------- | ----------------- |
| Initial draft | N/A      | 创建 PRD v0.1      |

## 1. 引言

### 1.1 项目目标
本项目旨在开发一个遵循模型上下文协议 (Model Context Protocol, MCP) 的服务器。该服务器的核心功能是提供与 Pinterest 平台交互的能力，允许 MCP 客户端（如 IDE、AI 助手等）通过标准化的接口搜索 Pinterest 图片，获取图片信息，并将图片下载到指定位置。

### 1.2 范围
当前版本 (v0.1) 的范围聚焦于实现基本的 Pinterest 图片搜索和下载功能，无需用户认证。

### 1.3 目标受众
*   MCP 客户端/主机开发者：希望将 Pinterest 图片搜索和下载功能集成到他们的应用程序中。
*   最终用户：通过支持 MCP 的客户端使用此服务器提供的 Pinterest 功能。

## 2. 当前特性 (MVP - Minimum Viable Product)

*   **协议**: 基于 Model Context Protocol (MCP)。
*   **核心功能**: 提供 Pinterest 图片的搜索和下载能力。
*   **认证**: 当前版本不需要 Pinterest 用户认证即可使用。
*   **错误处理**: 在操作失败（如搜索无结果、下载失败）时，向 MCP 客户端返回明确的错误信息。
*   **提供的 MCP Tools**:
    *   `pinterest_search`
    *   `pinterest_get_image_info`
    *   `pinterest_search_and_download`

## 3. 用户故事 Backlog (已实现 v0.1)

### 3.1 US-001: 作为 MCP 客户端，我想要根据关键词搜索 Pinterest 图片，以便找到相关的视觉内容。
*   **Tool**: `pinterest_search`
*   **输入**:
    *   `keyword`: 字符串 (必需, 搜索关键词)
    *   `limit`: 整数 (可选, 需要返回的图片数量，若不提供可能有默认值或限制)
*   **输出**:
    *   **成功**: 返回一个包含图片信息的列表（具体包含哪些信息，例如图片 ID、缩略图 URL 等需要明确，目前假设至少有图片 ID）。
    *   **失败**: 如果没有找到图片或发生其他错误，返回具体的错误信息给客户端。
*   **验收标准**:
    *   客户端可以通过 MCP 调用 `pinterest_search` Tool。
    *   调用时必须提供 `keyword` 参数。
    *   可以指定 `limit` 参数来限制结果数量。
    *   如果搜索成功，返回的列表包含与关键词相关的图片信息（至少包含图片 ID）。
    *   如果没有找到图片，返回清晰的"未找到结果"类型的错误信息。
    *   如果发生其他错误（如网络问题），返回相应的错误信息。

### 3.2 US-002: 作为 MCP 客户端，我想要获取特定 Pinterest 图片的详细信息，以便了解其来源和 URL。
*   **Tool**: `pinterest_get_image_info`
*   **输入**:
    *   `image_id`: 字符串 (必需, 需要获取信息的 Pinterest 图片 ID)
*   **输出**:
    *   **成功**: 返回包含以下信息的对象：
        *   `image_url`: 图片的直接 URL。
        *   `source`: 图片来源信息 (例如 "pinterest.com")。
        *   `timestamp`: 获取信息的时间戳。
    *   **失败**: 如果提供的 `image_id` 无效或找不到对应的图片，或者发生其他错误，返回具体的错误信息给客户端。
*   **验收标准**:
    *   客户端可以通过 MCP 调用 `pinterest_get_image_info` Tool。
    *   调用时必须提供 `image_id` 参数。
    *   如果成功，返回包含 `image_url`, `source`, `timestamp` 的对象。
    *   如果 `image_id` 无效或未找到，返回清晰的"图片未找到"类型的错误信息。
    *   如果发生其他错误，返回相应的错误信息。

### 3.3 US-003: 作为 MCP 客户端，我想要根据关键词搜索 Pinterest 图片并将其下载到服务器指定目录，以便离线使用这些图片。
*   **Tool**: `pinterest_search_and_download`
*   **输入**:
    *   `keyword`: 字符串 (必需, 搜索关键词)
    *   `limit`: 整数 (可选, 需要搜索并尝试下载的图片数量)
*   **输出**:
    *   **成功**: 返回表示操作成功的消息（例如，"成功下载 X 张图片"）。
    *   **失败**: 如果没有找到图片、下载过程中发生错误（网络、磁盘权限/空间等），或所有找到的图片都下载失败，返回具体的错误信息给客户端。
*   **行为**:
    *   服务器执行 Pinterest 图片搜索（类似 `pinterest_search`）。
    *   对于搜索到的每张图片（最多 `count` 张），尝试下载到服务器的预定义目录。
    *   **下载路径 (硬编码)**: `path.join(__dirname, '../downloads')` (相对于服务器脚本的位置)。
    *   **文件名**: `pinterest_{imageId}.{fileExtension}` (例如: `pinterest_12345.jpg`)。
*   **验收标准**:
    *   客户端可以通过 MCP 调用 `pinterest_search_and_download` Tool。
    *   调用时必须提供 `keyword` 参数。
    *   可以指定 `limit` 参数。
    *   如果搜索到图片并成功下载至少一张，Tool 应返回成功消息。
    *   下载的图片应保存在服务器的 `../downloads` 目录下。
    *   下载的文件名应遵循 `pinterest_{imageId}.{fileExtension}` 格式。
    *   如果没有找到图片，返回清晰的"未找到结果"类型的错误信息。
    *   如果在下载过程中遇到任何错误（如网络问题、磁盘无法写入），应向客户端报告相应的错误信息。

## 4. 约束与假设 (v0.1)

*   **无认证**: 当前版本不处理 Pinterest 用户认证。搜索和下载是基于公开可访问的内容进行的。
*   **固定下载目录**: 图片总是下载到服务器本地的 `../downloads` 目录，客户端无法指定。
*   **错误粒度**: 错误信息会返回给客户端，但具体的错误分类和代码可能需要进一步定义。
*   **速率限制**: 未明确处理 Pinterest 可能存在的 API 速率限制。

## 5. 未来考虑 / Backlog (潜在)

*   **US-Future-001 (原: 可配置下载目录)**: **(实现方式: 服务器环境变量)** 服务器管理员可以通过设置 `MCP_PINTEREST_DOWNLOAD_DIR` 环境变量来指定所有图片下载的目标根目录。如果该环境变量未设置，服务器将使用默认路径 (例如: `../downloads`)。客户端无法在调用时指定下载路径。(优先级: 高)
    *   *注: 服务器启动时应检查该目录是否存在且可写，若无效则应报错或记录日志并使用默认路径。*
*   **US-Future-002 (新): 自定义文件名模板**: **(实现方式: 服务器环境变量)** 服务器管理员可以通过设置 `MCP_PINTEREST_FILENAME_TEMPLATE` 环境变量来定义全局的文件命名规则模板。如果该环境变量未设置，服务器将使用默认模板 (`pinterest_{imageId}.{fileExtension}`)。客户端无法在调用时指定命名模板。(优先级: 高)
    *   *注: 支持的模板变量应包含 `{imageId}`, `{fileExtension}`, `{timestamp}` (如 `YYYYMMDDHHMMSS`), `{index}` (批次下载序号)。服务器应验证模板有效性并清理生成的文件名中的非法字符。若模板无效，应记录日志并使用默认模板。*
*   **US-Future-003 (新): 下载前确认/选择**: 作为 MCP 客户端，我想要在执行批量下载前先预览搜索到的图片列表 (可能通过 `pinterest_search` 返回的结果)，并能选择性地指定下载哪些图片 (可能通过未来的 `pinterest_download_image` 或 `pinterest_batch_download_images` 工具实现)，以便只下载我真正需要的图片。
*   **Pinterest 认证**: 支持用户通过 OAuth 或 API Key 进行认证，以访问非公开内容或获取更高的速率限制。
*   **更丰富的搜索参数**: 支持更多 Pinterest API 提供的搜索过滤条件（如画板 ID、图片尺寸、颜色等）。
*   **Tool: `pinterest_download_image`**: 提供一个单独的 Tool，允许客户端通过图片 ID (以及可选的目标路径和文件名模板 - *注: 如果这些也改为环境变量控制，则此 Tool 只需图片 ID*) 直接下载图片。 (此工具可支持 US-Future-003)
*   **批量获取信息**: 可能需要一个 Tool 来批量获取多个图片 ID 的信息。
*   **Tool: `pinterest_batch_download_images`**: 提供一个单独的 Tool，允许客户端一次传入多个图片 ID 列表进行批量下载。(此工具可支持 US-Future-003)
*   **更详细的错误码**: 定义更具体的错误代码和消息，方便客户端进行处理。
*   **异步下载**: 对于大量图片的下载，考虑采用异步处理模式，并提供查询下载状态的机制。

## 6. 审批状态

**本文档为初稿 (v0.1)，需要项目相关方（特别是提出需求的您）审阅和批准后才能视为基线。**

请审阅本文档，确认其内容是否准确反映了当前已实现的功能和我们讨论的需求。如有任何遗漏、错误或需要修改之处，请提出。✅ 