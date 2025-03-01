# Pinterest MCP Server

[![smithery badge](https://smithery.ai/badge/mcp-pinterest)](https://smithery.ai/server/mcp-pinterest)

A Model Context Protocol (MCP) server for Pinterest image search and information retrieval.

## Features

- Search for images on Pinterest by keywords
- Retrieve detailed information about Pinterest images
- Seamless integration with Cursor IDE through MCP
- Support for headless browser mode
- Limit control for search results

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Cursor IDE](https://cursor.sh/) for MCP integration

## Installation

### Installing via Smithery

To install mcp-pinterest for Claude Desktop automatically via [Smithery](https://smithery.ai/server/mcp-pinterest):

```bash
npx -y @smithery/cli install mcp-pinterest --client claude
```

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/pinterest-mcp-server.git
   cd pinterest-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Command Mode (Recommended)

Build the server:
```bash
npm run build
```

You can now use this server as an MCP server in Cursor.

## Configuring as MCP Server in Cursor

1. Open Cursor IDE
2. Go to Settings (⚙️) > Extensions > MCP
3. Click "Add Server"
4. Enter the following details:
   - Name: Pinterest MCP
   - TYPE: COMMAND
   - COMMAND: node /path/to/mcp-pinterest/dist/pinterest-mcp-server.js
5. Click "Save"

## Available MCP Functions

The server exposes the following MCP functions:

- `pinterest_search`: Search for images on Pinterest by keyword
  - Parameters:
    - `keyword`: Search term (required)
    - `limit`: Number of images to return (default: 10)
    - `headless`: Whether to use headless browser mode (default: true)

- `pinterest_get_image_info`: Get detailed information about a Pinterest image
  - Parameters:
    - `image_url`: URL of the Pinterest image (required)

## Example Usage in Cursor

Once configured, you can use the Pinterest MCP functions directly in Cursor's AI chat:

```
Search for robot images on Pinterest
```

The AI will use the MCP server to search Pinterest and display the results.

### Example Screenshot

![Pinterest Search Example](screenshot.png)

*Screenshot showing a search for 20 images of 三上悠亚 with all images successfully downloaded.*

## Development

### Project Structure

- `pinterest-mcp-server.ts`: Main server file
- `dist/pinterest-mcp-server.js`: Built JavaScript file for production
- `package.json`: Project configuration and dependencies

### Adding New Features

To add new MCP functions:

1. Modify `pinterest-mcp-server.ts`
2. Register new functions using the MCP SDK
3. Implement the function logic
4. Rebuild with `npm run build`

## Troubleshooting

- If the server fails to start, check if the port is already in use
- Ensure all dependencies are correctly installed with `npm install`
- Make sure TypeScript is properly configured with a `tsconfig.json` file
- If you encounter build errors, try running `npm install -D typescript @types/node`
- Verify network connectivity for Pinterest access

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 