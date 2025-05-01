---
title: Pinterest MCP Server - Product Requirements Document (PRD) - v0.1
status: Draft
date: {current_date}
---

# Pinterest MCP Server - 产品需求文档 (PRD) v0.1

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