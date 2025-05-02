# Epic-2 - Story-2

自定义文件名模板

**作为** 服务器管理员，
**我想要** 通过设置一个环境变量 (`MCP_PINTEREST_FILENAME_TEMPLATE`) 来定义 Pinterest MCP 服务器下载文件时使用的全局命名模板，
**以便** 确保所有下载的文件名遵循统一的、符合管理需求的格式。

## Status

Completed

## Context

{
- **Background:** 当前服务器下载的文件名格式是硬编码的 `pinterest_{imageId}.{fileExtension}`。
- **Current state:** 需要一种方式来定制下载文件的命名规则。
- **Story justification:** 允许管理员根据需求（例如，加入时间戳、索引）生成标准化的文件名，方便归档和检索。
- **Technical context:** 需要修改下载逻辑以解析模板字符串并使用支持的变量生成文件名，同时需要实现文件名清理逻辑。
- **Business drivers:** 提升文件管理效率和规范性。
- **Relevant history:** N/A (可能与 US-Future-001 有依赖关系，因为文件名是应用在下载路径下的)
}

## Estimation

Story Points: 5

## Tasks

{
1.  - [x] **环境变量处理:**
    1.  - [x] 服务器启动时检查 `MCP_PINTEREST_FILENAME_TEMPLATE` 环境变量。
    2.  - [x] 如果设置了环境变量，存储模板供后续使用。
    3.  - [x] 如果未设置环境变量，确认使用默认模板 `pinterest_{imageId}.{fileExtension}`。
2.  - [x] **模板解析与文件名生成:**
    1.  - [x] 实现模板解析逻辑，支持变量：`{imageId}`, `{fileExtension}`, `{timestamp}` (YYYYMMDDHHMMSS UTC), `{index}` (可选)。
    2.  - [x] 在文件下载时，根据模板和可用变量生成文件名。
    3.  - [x] 实现文件名清理逻辑，移除或替换操作系统不允许的字符 (`/ \ : * ? " < > |`)。
3.  - [x] **错误处理:**
    1.  - [x] 验证模板字符串的有效性（例如，括号匹配，变量支持）。
    2.  - [x] 如果模板无效，记录警告并回退到默认模板。
4.  - [x] **文档更新:**
    1.  - [x] 在服务器文档中清晰说明 `MCP_PINTEREST_FILENAME_TEMPLATE` 环境变量、支持的变量及其行为。
5.  - [x] **依赖确认:**
    1.  - [x] 确认客户端调用下载工具时不再允许通过参数指定文件名格式。
}

## Constraints

- 时间戳格式固定为 `YYYYMMDDHHMMSS` (UTC)。
- 文件名非法字符替换为下划线。
- 变量名大小写不敏感。

## Data Models / Schema

- N/A

## Structure

- 创建了 `src/filename-template.ts` 模块实现模板解析和文件名生成
- 修改了 `pinterest-mcp-server.ts` 以支持环境变量指定的文件名模板
- 更新了 `src/pinterest-download.js` 以使用模板生成文件名
- 更新了 `README.md` 文档以说明文件名模板特性

## Diagrams

- N/A

## Dev Notes

- 实现方式：通过服务器环境变量 `MCP_PINTEREST_FILENAME_TEMPLATE` 实现。
- 优先级：高。
- 模板变量的大小写不敏感，便于使用。
- `{index}` 变量在批量下载时传递，从1开始。
- 文件名清理采用替换为下划线的策略，确保跨平台兼容性。

## Chat Command Log

- N/A 