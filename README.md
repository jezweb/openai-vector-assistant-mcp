# OpenAI Vector Store MCP Server

A production-ready Model Context Protocol (MCP) server that provides comprehensive OpenAI Vector Store API access through Cloudflare Workers. This server enables AI assistants like Claude and Roo to manage vector stores, files, and batch operations seamlessly.

## 🚀 Live Production Server

**Production URL**: `https://mcp-server-cloudflare.webfonts.workers.dev`

The server is live and ready to use! Simply configure your MCP client with your OpenAI API key.

## ✨ Features

- **15 Vector Store Tools** - Complete coverage of OpenAI's Vector Store API
- **Production Ready** - Deployed on Cloudflare Workers with global edge distribution
- **Zero Dependencies** - Lightweight implementation with no runtime dependencies
- **Type Safe** - Full TypeScript implementation with comprehensive type definitions
- **Secure Authentication** - URL-based API key authentication
- **Error Handling** - Robust error handling with detailed error messages
- **CORS Support** - Ready for web-based MCP clients

## 📊 Current Status

✅ **Phase 1 Complete** - All 15 tools implemented and tested  
✅ **Production Deployment** - Live on Cloudflare Workers  
✅ **Client Integration** - Working with Claude Desktop and Roo  
✅ **Comprehensive Testing** - All tools validated and functional  

## 🛠️ Available Tools

### Core Vector Store Operations
1. **vector-store-create** - Create a new vector store with optional expiration and metadata
2. **vector-store-list** - List all vector stores with pagination and sorting
3. **vector-store-get** - Get detailed information about a specific vector store
4. **vector-store-delete** - Delete a vector store permanently
5. **vector-store-modify** - Update vector store name, expiration, or metadata

### File Management Operations
6. **vector-store-file-add** - Add an existing file to a vector store
7. **vector-store-file-list** - List all files in a vector store with filtering
8. **vector-store-file-get** - Get details of a specific file in a vector store
9. **vector-store-file-content** - Retrieve the content of a file in a vector store
10. **vector-store-file-update** - Update file metadata
11. **vector-store-file-delete** - Remove a file from a vector store

### Batch Operations
12. **vector-store-file-batch-create** - Create a batch operation for multiple files
13. **vector-store-file-batch-get** - Get the status of a batch operation
14. **vector-store-file-batch-cancel** - Cancel a running batch operation
15. **vector-store-file-batch-files** - List files in a batch operation

## 🚀 Quick Start

### Prerequisites

- OpenAI API key with Assistants API access
- Node.js 18+ (for MCP proxy)
- MCP client (Claude Desktop or Roo)

### Claude Desktop Setup

1. Install the MCP proxy:
```bash
npm install -g mcp-proxy
```

2. Add to your Claude Desktop configuration (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": [
        "mcp-proxy",
        "https://mcp-server-cloudflare.webfonts.workers.dev/mcp/YOUR_OPENAI_API_KEY_HERE"
      ]
    }
  }
}
```

3. Replace `YOUR_OPENAI_API_KEY_HERE` with your actual OpenAI API key
4. Restart Claude Desktop

### Roo Setup

1. Install the MCP proxy:
```bash
npm install -g mcp-proxy
```

2. Add to your Roo configuration:
```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": [
        "mcp-proxy",
        "https://mcp-server-cloudflare.webfonts.workers.dev/mcp/YOUR_OPENAI_API_KEY_HERE"
      ],
      "alwaysAllow": [
        "vector-store-create",
        "vector-store-list",
        "vector-store-get",
        "vector-store-delete",
        "vector-store-modify",
        "vector-store-file-add",
        "vector-store-file-list",
        "vector-store-file-get",
        "vector-store-file-content",
        "vector-store-file-update",
        "vector-store-file-delete",
        "vector-store-file-batch-create",
        "vector-store-file-batch-get",
        "vector-store-file-batch-cancel",
        "vector-store-file-batch-files"
      ]
    }
  }
}
```

3. Replace `YOUR_OPENAI_API_KEY_HERE` with your actual OpenAI API key
4. Restart Roo

## 📖 Usage Examples

### Basic Vector Store Management

```
# List existing vector stores
"List my vector stores"

# Create a new vector store
"Create a vector store named 'Project Documents' that expires in 7 days"

# Get details of a specific vector store
"Get details of vector store vs_abc123"

# Delete a vector store
"Delete vector store vs_abc123"
```

### File Operations

```
# Add a file to a vector store
"Add file file-abc123 to vector store vs_def456"

# List files in a vector store
"List all files in vector store vs_def456"

# Get file content
"Get the content of file file-abc123 in vector store vs_def456"
```

### Batch Operations

```
# Create a batch operation
"Create a batch to add files file-1, file-2, file-3 to vector store vs_def456"

# Check batch status
"Get status of batch batch_abc123 in vector store vs_def456"
```

## 🏗️ Architecture

### Clean Design Principles

- **Single Worker Pattern** - All functionality in one Cloudflare Worker
- **URL-Based Authentication** - Simple `/mcp/{api-key}` pattern
- **Direct HTTP Transport** - No complex proxy layers needed
- **Minimal Dependencies** - Only TypeScript types for development
- **Type Safety** - Comprehensive TypeScript throughout

### File Structure

```
src/
├── worker.ts              # Main Cloudflare Worker entry point
├── mcp-handler.ts         # MCP protocol implementation
├── types.ts               # TypeScript type definitions
└── services/
    └── openai-service.ts  # OpenAI API client wrapper
```

### Key Components

- **Worker** - Handles HTTP requests and CORS
- **MCP Handler** - Implements MCP protocol (initialize, tools/list, tools/call)
- **OpenAI Service** - Wraps OpenAI Vector Store API calls
- **Types** - Comprehensive TypeScript definitions

## 🧪 Testing

### Manual Testing

Test the server directly with curl:

```bash
# List available tools
curl -X POST "https://mcp-server-cloudflare.webfonts.workers.dev/mcp/YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# Create a vector store
curl -X POST "https://mcp-server-cloudflare.webfonts.workers.dev/mcp/YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "vector-store-create",
      "arguments": {
        "name": "Test Store",
        "expires_after_days": 1
      }
    }
  }'
```

### Client Testing

Use the provided test scripts:

- [`test-mcp-client.js`](test-mcp-client.js) - Node.js MCP client test
- [`test-mcp-http-client.js`](test-mcp-http-client.js) - Direct HTTP API test
- [`demo-vector-store-mcp.js`](demo-vector-store-mcp.js) - Comprehensive demo

## 📚 Documentation

### Setup Guides
- [Client Setup Guide](CLIENT-SETUP-GUIDE.md) - Detailed setup instructions
- [Vector Store Usage Guide](VECTOR-STORE-MCP-USAGE.md) - Usage examples and patterns
- [Client Integration Guide](README-CLIENT-INTEGRATION.md) - Integration patterns

### Technical Documentation
- [Project Brief](00-PROJECT-BRIEF.md) - Mission and overview
- [Requirements](01-REQUIREMENTS.md) - Technical requirements
- [Architecture](02-ARCHITECTURE.md) - System design
- [API Reference](03-API-REFERENCE.md) - OpenAI API details
- [Implementation Guide](04-IMPLEMENTATION-GUIDE.md) - Development guide
- [Testing Guide](05-TESTING-GUIDE.md) - Testing strategies
- [Deployment Guide](06-DEPLOYMENT-GUIDE.md) - Cloudflare deployment
- [Examples](08-EXAMPLES.md) - Code templates
- [Project Summary](99-SUMMARY.md) - Complete overview

## 🔧 Development

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/jezweb/openai-vector-assistant-mcp.git
cd openai-vector-assistant-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Add your OpenAI API key to wrangler.toml or use wrangler secrets
wrangler secret put OPENAI_API_KEY
```

4. Start development server:
```bash
npm run dev
```

### Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

The server will be available at your Cloudflare Workers domain.

## 🔒 Security

- **API Key Protection** - API keys are passed via URL path, not logged
- **Input Validation** - All inputs validated before processing
- **Error Handling** - Errors don't expose sensitive information
- **CORS Security** - Proper CORS headers for web clients
- **Rate Limiting** - Inherits OpenAI API rate limits

## 🚀 Performance

- **Global Edge** - Deployed on Cloudflare's global network
- **Sub-100ms** - Typical response times under 100ms
- **Zero Cold Start** - Cloudflare Workers eliminate cold starts
- **Efficient** - Minimal memory footprint and fast execution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

### Troubleshooting

Common issues and solutions:

1. **Authentication Errors** - Verify your OpenAI API key has Assistants API access
2. **Connection Issues** - Check that mcp-proxy is installed and accessible
3. **Tool Not Found** - Ensure your MCP client configuration is correct
4. **Rate Limits** - OpenAI API rate limits apply to all operations

### Getting Help

- Check the [Client Setup Guide](CLIENT-SETUP-GUIDE.md) for detailed setup instructions
- Review the [troubleshooting section](CLIENT-SETUP-GUIDE.md#troubleshooting) for common issues
- Test the server directly with curl to isolate client vs server issues
- Verify your OpenAI API key works with other OpenAI services

## 🎯 Roadmap

### Completed ✅
- [x] Core vector store operations (create, list, get, delete, modify)
- [x] File management operations (add, list, get, content, update, delete)
- [x] Batch operations (create, get, cancel, list files)
- [x] Production deployment on Cloudflare Workers
- [x] Client integration with Claude Desktop and Roo
- [x] Comprehensive documentation and testing

### Future Enhancements 🚧
- [ ] File upload/download capabilities
- [ ] Advanced search and filtering
- [ ] Caching layer for improved performance
- [ ] Webhook support for async operations
- [ ] Additional OpenAI API integrations

---

**Ready to get started?** Follow the [Quick Start](#-quick-start) guide above or check out the [Client Setup Guide](CLIENT-SETUP-GUIDE.md) for detailed instructions.