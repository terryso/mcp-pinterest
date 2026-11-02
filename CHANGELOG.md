# [1.2.1](https://github.com/terryso/mcp-pinterest/compare/v1.2.0...v1.2.1) (2026-11-02)

Hygiene release. No new Pinterest tools.

### Bug Fixes

* Send server and CLI logs to stderr so MCP JSON-RPC on stdout is not corrupted. `console.log` in the stdio entry, CLI, scraper, and downloader was writing startup noise (including a fake HTTP URL) onto the protocol stream.
* Escape `keyword` and scraped titles, links, and errors in `pinterest_search`, `pinterest_get_image_info`, and `pinterest_search_and_download` before they are placed in text tool results (#7). Ordinary image URLs stay copyable.
* Document that this is an MCP stdio server configured in Cursor, Claude Desktop, or another client with `npx pinterest-mcp-server`. The Smithery one-click install and server page are unavailable (404) and are marked as such (#2). README no longer claims a `.env` file is loaded.
* Map the documented `--proxyServer` CLI flag onto `MCP_PINTEREST_PROXY_SERVER`. `--port` is ignored because the server does not listen on TCP.

### Notes

* A `Dockerfile` is already in the repo and runs `node dist/pinterest-mcp-server.js` on stdio. Glama still needs the repository owner to Claim the listing and register that Dockerfile; this release does not have Glama admin access (#3).
* Publishing stays on the existing GitHub Actions. Merge does not publish by itself unless semantic-release on `master` cuts a release. A `v1.2.1` tag runs `.github/workflows/npm-publish.yml`. Do not publish from a workstation.

# [1.2.0](https://github.com/terryso/mcp-pinterest/compare/v1.1.0...v1.2.0) (2025-05-05)


### Features

* 去掉没用的依赖 ([f678443](https://github.com/terryso/mcp-pinterest/commit/f6784438ec166558a1f08971a0b9ecd4920e9646))

# [1.1.0](https://github.com/terryso/mcp-pinterest/compare/v1.0.0...v1.1.0) (2025-05-02)


### Features

* 添加npx命令支持 ([621bfbd](https://github.com/terryso/mcp-pinterest/commit/621bfbd5a8bf2b097c6463ea1aa730277d9befc7))
* 添加通过npx启动的CLI支持 ([d93ebca](https://github.com/terryso/mcp-pinterest/commit/d93ebca7e659ffcdeec9e20f0b4148cfea8ea607))

# 1.0.0 (2025-05-02)


### Bug Fixes

* 修复自动发布失败的问题 ([ab726c4](https://github.com/terryso/mcp-pinterest/commit/ab726c4191b0c7bf61477133a41d5192e8a05a37))


### Features

* 增加自动发布功能 ([c5982f6](https://github.com/terryso/mcp-pinterest/commit/c5982f65e8e22724a36e443c478f629eb94b705a))
