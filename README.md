# Universal OpenAI Vector Store MCP Server

A production-ready Model Context Protocol (MCP) server that provides comprehensive OpenAI Vector Store API access through multiple deployment options. This server enables AI assistants like Claude, Roo, and other MCP clients to manage vector stores, files, and batch operations seamlessly.

## 🌟 Universal MCP Server - Three Ways to Connect

Choose the deployment option that best fits your needs:

### 🚀 Option 1: Cloudflare Workers (Production Ready)
**Production URL**: `https://vectorstore.jezweb.com`
- ✅ Zero setup required
- ✅ Global edge distribution
- ✅ Sub-100ms response times
- ✅ No local dependencies

### 📦 Option 2: NPM Package (Local Stdio)
**Package**: `openai-vector-store-mcp`
- ✅ Direct stdio transport
- ✅ No proxy required
- ✅ Local execution
- ✅ Full control over environment

### 🔧 Option 3: Local Development Server
**Local Build**: Clone and run locally
- ✅ Full source code access
- ✅ Customizable implementation
- ✅ Development and testing
- ✅ Private deployment options

## ✨ Features

- **21 Comprehensive Tools** - Complete file-to-vector-store workflow with OpenAI's APIs
- **File Upload Capabilities** - Direct file upload from local filesystem to OpenAI
- **Production Ready** - Deployed on Cloudflare Workers with global edge distribution
- **Zero Dependencies** - Lightweight implementation with no runtime dependencies
- **Type Safe** - Full TypeScript implementation with comprehensive type definitions
- **Secure Authentication** - URL-based API key authentication
- **Error Handling** - Robust error handling with detailed error messages
- **CORS Support** - Ready for web-based MCP clients
- **Large File Support** - Multipart uploads for files up to 512MB

## 📊 Current Status

✅ **Phase 2 v1.2.0 Complete** - Complete file-to-vector-store workflow with 21 tools
✅ **Production Deployment** - Live on Cloudflare Workers with global edge distribution
✅ **Client Integration** - Working with Claude Desktop, Roo, and all MCP clients
✅ **End-to-End Workflow** - Upload files directly from local filesystem to vector stores
✅ **Real-World Ready** - Solves the 470 PDF files scenario and similar use cases

## 🛠️ Available Tools (21 Total)

### Core Vector Store Operations
1. **vector-store-create** - Create a new vector store with optional expiration and metadata
2. **vector-store-list** - List all vector stores with pagination and sorting
3. **vector-store-get** - Get detailed information about a specific vector store
4. **vector-store-delete** - Delete a vector store permanently
5. **vector-store-modify** - Update vector store name, expiration, or metadata

### 🆕 File Upload & Management Operations (Phase 2)
6. **file-upload** - Upload local files directly to OpenAI (CRITICAL - enables end-to-end workflow)
7. **file-list** - List all uploaded files with filtering and pagination
8. **file-get** - Get detailed information about specific files
9. **file-delete** - Remove files from OpenAI storage
10. **file-content** - Download and retrieve file content
11. **upload-create** - Create multipart uploads for large files (>25MB)

### Vector Store File Operations
12. **vector-store-file-add** - Add an existing file to a vector store
13. **vector-store-file-list** - List all files in a vector store with filtering
14. **vector-store-file-get** - Get details of a specific file in a vector store
15. **vector-store-file-content** - Retrieve the content of a file in a vector store
16. **vector-store-file-update** - Update file metadata
17. **vector-store-file-delete** - Remove a file from a vector store

### Batch Operations
18. **vector-store-file-batch-create** - Create a batch operation for multiple files
19. **vector-store-file-batch-get** - Get the status of a batch operation
20. **vector-store-file-batch-cancel** - Cancel a running batch operation
21. **vector-store-file-batch-files** - List files in a batch operation

## 🚀 Quick Start - Choose Your Installation Method

### Prerequisites

- OpenAI API key with Assistants API access
- Node.js 18+ (for NPM package or local development)
- MCP client (Claude Desktop, Roo, or other MCP-compatible client)

### 🔑 Getting Started with OpenAI

Before using this MCP server, you'll need to set up your OpenAI account and API access:

#### 1. **Get Your OpenAI API Key**
- Visit the [OpenAI API Keys page](https://platform.openai.com/api-keys)
- Create a new API key or use an existing one
- Copy your API key (starts with `sk-proj-` or `sk-`)

#### 2. **Check Your Vector Store Dashboard**
- Monitor your vector stores at [OpenAI Storage Dashboard](https://platform.openai.com/storage)
- View usage, file counts, and storage limits
- Track vector store expiration dates

#### 3. **Verify Assistants API Access**
- Ensure your account has access to the Assistants API
- Check your [OpenAI Usage Dashboard](https://platform.openai.com/usage) for API limits
- Review [OpenAI Pricing](https://openai.com/pricing) for vector store costs

#### 4. **Understand Vector Store Limits**
- **Free Tier**: Limited vector store usage
- **Paid Tier**: Higher limits based on your plan
- **File Limits**: Each vector store can contain up to 10,000 files
- **Storage Limits**: Check your account's storage quota

#### 📚 **Helpful OpenAI Resources**
- [Vector Stores Documentation](https://platform.openai.com/docs/assistants/tools/file-search)
- [Assistants API Guide](https://platform.openai.com/docs/assistants/overview)
- [File Upload Documentation](https://platform.openai.com/docs/api-reference/files)
- [OpenAI Community Forum](https://community.openai.com/)

---

## 📦 Option 1: NPM Package (Recommended for Most Users)

### Installation

```bash
# Option A: Use directly with npx (recommended for latest fixes)
npx openai-vector-store-mcp@latest

# Option B: Install globally
npm install -g openai-vector-store-mcp@latest

# Option C: Install locally in your project
npm install openai-vector-store-mcp@latest
```

**💡 Why use @latest?**
- Ensures you get the most recent bug fixes and improvements
- Bypasses NPM cache issues that can cause outdated versions
- Recommended for most reliable experience

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": ["openai-vector-store-mcp@latest"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key-here"
      }
    }
  }
}
```

### Roo Configuration

Add to your Roo configuration file:

```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": ["openai-vector-store-mcp@latest"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key-here"
      },
      "alwaysAllow": [
        "vector-store-create",
        "vector-store-list",
        "vector-store-get",
        "vector-store-delete",
        "vector-store-modify",
        "file-upload",
        "file-list",
        "file-get",
        "file-delete",
        "file-content",
        "upload-create",
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

---

## 🖥️ Claude Code CLI Configuration

For users of Claude Code (CLI), you can add the MCP server using the command line interface:

### Basic Setup

```bash
# Add the MCP server with local scope (default - available only in current project)
claude mcp add openai-vector-store -- npx openai-vector-store-mcp@latest --env OPENAI_API_KEY="your-openai-api-key-here"

# Add with project scope (shared with team via .mcp.json file)
claude mcp add --scope project openai-vector-store -- npx openai-vector-store-mcp@latest --env OPENAI_API_KEY="your-openai-api-key-here"

# Add with user scope (available across all your projects)
claude mcp add --scope user openai-vector-store -- npx openai-vector-store-mcp@latest --env OPENAI_API_KEY="your-openai-api-key-here"
```

### Scope Options

- **`--scope local`** (default): Available only to you in the current project
- **`--scope project`**: Shared with everyone in the project via `.mcp.json` file
- **`--scope user`**: Available to you across all projects

### Managing MCP Servers

```bash
# List all configured servers
claude mcp list

# Get details for the server
claude mcp get openai-vector-store

# Remove the server
claude mcp remove openai-vector-store

# Check server status within Claude Code
/mcp
```

### Project-Level Configuration (.mcp.json)

When using `--scope project`, Claude Code creates a `.mcp.json` file in your project root:

```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": ["openai-vector-store-mcp@latest"],
      "env": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY}"
      }
    }
  }
}
```

**Environment Variable Expansion**: Claude Code supports `${VAR}` syntax for environment variables in `.mcp.json` files.

---

## ☁️ Option 2: Cloudflare Workers (Zero Setup)

### Claude Desktop Configuration

1. Install the MCP proxy:
```bash
npm install -g mcp-proxy
```

2. Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": [
        "mcp-proxy",
        "https://vectorstore.jezweb.com/mcp/YOUR_OPENAI_API_KEY_HERE"
      ]
    }
  }
}
```

### Roo Configuration

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
        "https://vectorstore.jezweb.com/mcp/YOUR_OPENAI_API_KEY_HERE"
      ],
      "alwaysAllow": [
        "vector-store-create",
        "vector-store-list",
        "vector-store-get",
        "vector-store-delete",
        "vector-store-modify",
        "file-upload",
        "file-list",
        "file-get",
        "file-delete",
        "file-content",
        "upload-create",
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

---

## 🔧 Option 3: Local Development Server

### Setup

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

### Configuration

Use the local server URL in your MCP client configuration, replacing the Cloudflare Workers URL with your local development server URL (typically `http://localhost:8787`).

---

## 🔄 Configuration File Locations

### Claude Desktop
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Roo
- Check your Roo installation documentation for the exact configuration file location
- Typically: `~/.config/roo/config.json` or similar

### Important Notes

1. **Replace API Key**: Always replace `YOUR_OPENAI_API_KEY_HERE` with your actual OpenAI API key
2. **Restart Client**: Restart your MCP client after configuration changes
3. **Roo Users**: The `alwaysAllow` array is crucial for Roo to automatically approve tool usage
4. **Security**: Never commit your API key to version control

## 📖 Usage Examples

### 🆕 Complete End-to-End Workflow (Phase 2 v1.2.0)

**The Problem Solved**: Previously, users had to manually upload files to OpenAI before using vector store tools. Now you can upload files directly from your local filesystem!

#### Basic Workflow
```
# 1. Upload a local file to OpenAI
"Upload the file ./documents/report.pdf to OpenAI"

# 2. Create a vector store for the uploaded files
"Create a vector store named 'Project Documents' that expires in 7 days"

# 3. Add the uploaded file to the vector store
"Add file file-abc123 to vector store vs_def456"

# 4. Now you can query the documents using OpenAI's Assistants API!
```

#### Real-World Example: Processing 470 PDF Files
```
# Upload multiple files from a directory
"Upload all PDF files from ./research-papers/ to OpenAI"

# Create a dedicated vector store
"Create a vector store named 'Research Papers Collection' that expires in 30 days"

# Batch add all uploaded files to the vector store
"Create a batch to add all uploaded PDF files to the Research Papers Collection vector store"

# Monitor batch processing
"Get the status of the batch operation"

# Query your knowledge base
"Search for papers about machine learning in the Research Papers Collection"
```

#### Advanced Workflow: Large File Handling
```
# For files larger than 25MB, use multipart upload
"Create a multipart upload for the file ./large-dataset.zip"

# Upload the large file in chunks
"Upload the large file ./large-dataset.zip using multipart upload"

# Add to vector store once upload completes
"Add the uploaded large file to vector store vs_def456"
```

### File Upload & Management

```
# Upload local files
"Upload the file ./data/research.txt to OpenAI"
"Upload all PDF files from ./documents/ to OpenAI"

# List uploaded files
"List all my uploaded files"
"List files uploaded in the last 7 days"

# Get file information
"Get details of file file-abc123"

# Download file content
"Get the content of file file-abc123"

# Delete files
"Delete file file-abc123 from OpenAI"
```

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

### Vector Store File Operations

```
# Add a file to a vector store
"Add file file-abc123 to vector store vs_def456"

# List files in a vector store
"List all files in vector store vs_def456"

# Get file content from vector store
"Get the content of file file-abc123 in vector store vs_def456"
```

### Batch Operations

```
# Create a batch operation
"Create a batch to add files file-1, file-2, file-3 to vector store vs_def456"

# Check batch status
"Get status of batch batch_abc123 in vector store vs_def456"
```

### Real-World Use Cases

#### 📄 Document Processing Pipeline
```
# Legal Document Analysis
1. "Upload all PDF files from ./legal-documents/ to OpenAI"
2. "Create a vector store named 'Legal Document Analysis' that expires in 90 days"
3. "Create a batch to add all uploaded legal documents to the vector store"
4. "Monitor batch processing status until complete"
5. "Search for clauses about liability in the legal documents"
6. "Find all references to termination conditions"

# Academic Research Processing
1. "Upload ./research-papers/paper1.pdf to OpenAI"
2. "Upload ./research-papers/paper2.pdf to OpenAI"
3. "Create a vector store named 'Literature Review' with metadata for project tracking"
4. "Add both uploaded papers to the Literature Review vector store"
5. "Query the papers for methodology comparisons"
```

#### 💻 Code Analysis Workflow
```
# Codebase Documentation and Analysis
1. "Upload all Python files from ./src/ to OpenAI"
2. "Upload all JavaScript files from ./frontend/ to OpenAI"
3. "Create a vector store named 'Codebase Analysis' that expires in 14 days"
4. "Batch add all uploaded source files to the codebase vector store"
5. "Find all functions that handle user authentication"
6. "Search for security-related code patterns"
7. "Identify API endpoints and their documentation"

# Code Review Preparation
1. "Upload changed files from ./src/modified/ to OpenAI"
2. "Add uploaded files to existing 'Code Review' vector store"
3. "Search for similar code patterns in the existing codebase"
```

#### 📚 Knowledge Base Creation
```
# Company Documentation System
1. "Upload all documentation files from ./company-docs/ to OpenAI"
2. "Upload policy files from ./policies/ to OpenAI"
3. "Create a vector store named 'Company Knowledge Base' that expires in 365 days"
4. "Create a batch operation to add all documentation to the knowledge base"
5. "Monitor batch processing and handle any failed uploads"
6. "Query the knowledge base for HR policies"
7. "Search for specific procedures and guidelines"

# Customer Support Knowledge Base
1. "Upload FAQ documents from ./support-docs/ to OpenAI"
2. "Upload troubleshooting guides from ./troubleshooting/ to OpenAI"
3. "Create a vector store named 'Support Knowledge Base'"
4. "Add all support documents to the vector store"
5. "Search for solutions to specific customer issues"
```

#### 🔬 Research and Analysis
```
# Market Research Analysis
1. "Upload market reports from ./market-research/ to OpenAI"
2. "Upload competitor analysis from ./competitor-data/ to OpenAI"
3. "Create a vector store named 'Market Intelligence' with expiration in 180 days"
4. "Batch add all research documents to the vector store"
5. "Search for market trends and opportunities"
6. "Compare competitor strategies across documents"

# Scientific Literature Review
1. "Upload research papers from ./literature/ to OpenAI"
2. "Create a vector store named 'Literature Review 2024'"
3. "Add papers to vector store with metadata tracking"
4. "Search for specific methodologies across papers"
5. "Find contradictory findings in the literature"
```

#### 📊 Data Processing Workflows
```
# Large Dataset Processing (470 PDF Scenario)
1. "List all PDF files in ./research-collection/ directory"
2. "Upload all 470 PDF files from ./research-collection/ to OpenAI"
3. "Create a vector store named 'Comprehensive Research Database'"
4. "Create batch operations to add files in groups of 50"
5. "Monitor all batch operations until completion"
6. "Verify all 470 files are successfully added to vector store"
7. "Search across entire collection for specific research topics"
8. "Generate summaries of key findings across all documents"

# Content Management System
1. "Upload articles from ./content/articles/ to OpenAI"
2. "Upload blog posts from ./content/blog/ to OpenAI"
3. "Create vector stores for different content categories"
4. "Organize content by topic using separate vector stores"
5. "Search for content gaps and opportunities"
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
curl -X POST "https://vectorstore.jezweb.com/mcp/YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# Create a vector store
curl -X POST "https://vectorstore.jezweb.com/mcp/YOUR_API_KEY" \
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

## 🆘 Troubleshooting & Support

### @latest Package Issues

#### NPM Cache Problems
If you're experiencing issues with outdated versions, use `@latest` to bypass cache:

```bash
# Clear NPM cache and use @latest
npm cache clean --force
npx openai-vector-store-mcp@latest

# For global installations
npm uninstall -g openai-vector-store-mcp
npm install -g openai-vector-store-mcp@latest
```

#### Version Conflicts
```bash
# Check current version
npx openai-vector-store-mcp@latest --version

# Force latest version in configuration
# Update your config to use @latest instead of version numbers
```

### Client-Specific Troubleshooting

#### Claude Desktop Issues

**Configuration file issues:**
```bash
# Verify configuration file syntax
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | python -m json.tool

# Ensure @latest is used in args
"args": ["openai-vector-store-mcp@latest"]
```

#### Claude Code CLI Issues

**Server not connecting:**
```bash
# Check server status
claude mcp list
claude mcp get openai-vector-store

# Re-add with @latest
claude mcp remove openai-vector-store
claude mcp add openai-vector-store -- npx openai-vector-store-mcp@latest --env OPENAI_API_KEY="your-key"
```

**Scope-related issues:**
```bash
# Check which scope the server is in
claude mcp list

# Add to correct scope
claude mcp add --scope user openai-vector-store -- npx openai-vector-store-mcp@latest --env OPENAI_API_KEY="your-key"
```

**Project .mcp.json issues:**
```bash
# Reset project choices if needed
claude mcp reset-project-choices

# Verify .mcp.json syntax
cat .mcp.json | python -m json.tool
```

### Common Connection Issues

#### 1. "Server not found" or "Connection failed"

**For NPM Package Users:**
```bash
# Always use @latest for most reliable experience
npx openai-vector-store-mcp@latest

# Test the server directly
OPENAI_API_KEY="your-key" npx openai-vector-store-mcp@latest
```

**For Cloudflare Workers Users:**
```bash
# Test the server directly
curl -X POST "https://vectorstore.jezweb.com/mcp/YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

**For Local Development:**
```bash
# Ensure the server is running
npm run dev

# Check if the server is accessible
curl -X POST "http://localhost:8787/mcp/YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

#### 2. "Authentication failed" or "Invalid API key"

- Verify your OpenAI API key is valid and active
- Check that your API key has access to the Assistants API
- Ensure there are no extra spaces or characters in your API key
- Test your API key with OpenAI's official tools

#### 3. "Tools not available" or "No MCP tools found"

- Restart your MCP client after configuration changes
- Check the configuration file syntax is valid JSON
- Verify the configuration file is in the correct location
- For NPM package: Ensure Node.js 18+ is installed

#### 4. Roo-Specific Issues

**"Permission denied" errors:**
- Ensure `alwaysAllow` is configured for all 21 tools
- Check that tool names in `alwaysAllow` match exactly
- Restart Roo after configuration changes

**Tool approval prompts:**
- Add all tool names to the `alwaysAllow` array
- Use the exact tool names as listed in the documentation
- Include the new Phase 2 file management tools: `file-upload`, `file-list`, `file-get`, `file-delete`, `file-content`, `upload-create`

### Platform-Specific Setup

#### macOS
```bash
# Install Node.js if not present
brew install node

# Install the MCP package with @latest
npm install -g openai-vector-store-mcp@latest

# Configuration file location
~/Library/Application Support/Claude/claude_desktop_config.json
```

#### Windows
```bash
# Install Node.js from nodejs.org
# Then install the MCP package with @latest
npm install -g openai-vector-store-mcp@latest

# Configuration file location
%APPDATA%\Claude\claude_desktop_config.json
```

#### Linux
```bash
# Install Node.js (Ubuntu/Debian)
sudo apt update && sudo apt install nodejs npm

# Install the MCP package with @latest
npm install -g openai-vector-store-mcp@latest

# Configuration file location
~/.config/Claude/claude_desktop_config.json
```

### Performance Optimization

#### For High-Volume Usage
1. **Use NPM Package**: Direct stdio transport is faster than HTTP proxy
2. **Local Development**: Run locally for maximum performance
3. **Batch Operations**: Use batch tools for multiple file operations
4. **Rate Limiting**: Be aware of OpenAI API rate limits

#### For Reliability
1. **Cloudflare Workers**: Global edge distribution with 99.9% uptime
2. **Error Handling**: All implementations include comprehensive error handling
3. **Retry Logic**: Built-in retry for transient failures

### Debug Mode

#### NPM Package Debug
```bash
DEBUG=* OPENAI_API_KEY="your-key" npx openai-vector-store-mcp@latest
```

#### Cloudflare Workers Debug
```bash
# Test with verbose curl output
curl -v -X POST "https://vectorstore.jezweb.com/mcp/YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

### Getting Help

1. **Check Documentation**: Review the [Universal MCP Server Guide](UNIVERSAL-MCP-SERVER-GUIDE.md)
2. **Test Isolation**: Test each component separately (API key, server, client)
3. **Configuration Validation**: Use JSON validators for configuration files
4. **Community Support**: Check MCP community resources and forums

### Migration from Previous Versions

If upgrading from version 1.1.x to 1.2.0:

1. **New File Management Tools**: 6 new tools added for complete file-to-vector-store workflow
2. **Update Roo Configuration**: Add new tools to `alwaysAllow` array for seamless operation
3. **Enhanced Capabilities**: Now supports direct file upload from local filesystem
4. **Version Update**: Update package references to use version 1.2.0

If upgrading from version 1.0.x:

1. **Update Configuration**: New installation options available
2. **Tool Names**: All 21 tools now available (was 4 in early versions)
3. **Performance**: Significant improvements in response times
4. **Reliability**: Enhanced error handling and retry logic

### Security Considerations

1. **API Key Protection**: Never commit API keys to version control
2. **Environment Variables**: Use environment variables for sensitive data
3. **Network Security**: All communications use HTTPS/TLS
4. **Access Control**: Server inherits your OpenAI API key permissions

## 📋 Best Practices

### Package Version Management

#### When to Use @latest
- **Recommended for most users**: Ensures you get the latest bug fixes and improvements
- **NPM cache issues**: Bypasses cache problems that can cause outdated versions
- **New installations**: Always use @latest for fresh setups
- **Troubleshooting**: First step when experiencing issues

#### When to Pin Versions
- **Production environments**: Consider pinning to specific versions for stability
- **CI/CD pipelines**: Pin versions to ensure reproducible builds
- **Team coordination**: Pin when entire team needs same version

#### Version Management Commands
```bash
# Check current version
npx openai-vector-store-mcp@latest --version

# Clear cache and update
npm cache clean --force
npm install -g openai-vector-store-mcp@latest

# Pin to specific version (if needed)
npm install -g openai-vector-store-mcp@1.2.3
```

### Client Configuration Best Practices

#### Claude Desktop
- Always use `@latest` in configuration files
- Restart Claude Desktop after configuration changes
- Use environment variables for API keys
- Validate JSON syntax before saving

#### Claude Code CLI
- Use appropriate scope for your needs:
  - `--scope local`: Personal development
  - `--scope project`: Team collaboration
  - `--scope user`: Cross-project utilities
- Leverage environment variable expansion in `.mcp.json`
- Use `/mcp` command to check server status

#### Roo
- Always include complete `alwaysAllow` array
- Use exact tool names as documented
- Restart Roo after configuration changes
- Prefer NPM package over Cloudflare Workers for best performance

### Troubleshooting Matrix

| Issue | Claude Desktop | Claude Code CLI | Roo |
|-------|---------------|-----------------|-----|
| **Outdated Version** | Use `@latest` in config | `claude mcp remove` then re-add with `@latest` | Use `@latest` in config |
| **Cache Issues** | `npm cache clean --force` | `npm cache clean --force` | `npm cache clean --force` |
| **Permission Denied** | Check API key in env | Check `--env` flag | Add tools to `alwaysAllow` |
| **Server Not Found** | Restart client | `claude mcp list` to verify | Restart Roo |
| **Config Syntax** | Validate JSON | `cat .mcp.json \| python -m json.tool` | Validate JSON |

### Security Best Practices

1. **API Key Management**
   - Never commit API keys to version control
   - Use environment variables in configuration files
   - Rotate API keys regularly
   - Monitor API usage for unusual activity

2. **Configuration Security**
   - Keep configuration files in secure locations
   - Use appropriate file permissions
   - Avoid sharing configuration files with embedded keys

3. **Network Security**
   - All communications use HTTPS/TLS
   - Server inherits your OpenAI API key permissions
   - Consider firewall rules for local development

## 🎯 Roadmap

### Version 1.2.0 - Complete File-to-Vector-Store Workflow ✅ COMPLETED
- [x] **File Upload Capabilities**: Direct file upload from local filesystem to OpenAI
- [x] **Complete End-to-End Workflow**: Transform from vector store management to complete pipeline
- [x] **Large File Support**: Multipart uploads for files up to 512MB
- [x] **File Management Suite**: Comprehensive file operations (upload, list, get, delete, content)
- [x] **Memory Efficiency**: Streaming uploads for large files
- [x] **MIME Type Detection**: Automatic content type detection
- [x] **21 Total Tools**: 6 new file management tools + 15 existing vector store tools
- [x] **Real-World Problem Solved**: 470 PDF files scenario and similar bulk processing use cases
- [x] **Production Ready**: Deployed and tested on Cloudflare Workers
- [x] **Client Integration**: Full compatibility with Claude Desktop, Roo, and all MCP clients

### Version 1.1.0 - Universal MCP Server ✅
- [x] **Three Installation Options**: NPM package, Cloudflare Workers, Local development
- [x] **Enhanced Roo Support**: Complete `alwaysAllow` configuration and troubleshooting
- [x] **Comprehensive Documentation**: Universal setup guide with platform-specific instructions
- [x] **Performance Optimization**: Direct stdio transport for NPM package
- [x] **Advanced Troubleshooting**: Platform-specific debug guides and migration instructions
- [x] **Security Enhancements**: Environment variable support and improved API key handling

### Version 1.0.0 - Core Implementation ✅
- [x] Core vector store operations (create, list, get, delete, modify)
- [x] File management operations (add, list, get, content, update, delete)
- [x] Batch operations (create, get, cancel, list files)
- [x] Production deployment on Cloudflare Workers
- [x] Client integration with Claude Desktop and Roo
- [x] Comprehensive documentation and testing

### Future Enhancements 🚧
- [ ] **Advanced Search**: Vector similarity search and filtering within vector stores
- [ ] **Caching Layer**: Redis/KV caching for improved performance
- [ ] **Webhook Support**: Async operation notifications for long-running uploads
- [ ] **Multi-Provider Support**: Support for other vector store providers (Pinecone, Weaviate)
- [ ] **Web Interface**: Optional web UI for vector store and file management
- [ ] **Batch File Processing**: Upload and process multiple files in a single operation
- [ ] **File Format Conversion**: Automatic conversion between supported file formats
- [ ] **Content Extraction**: Enhanced text extraction from PDFs, images, and other formats

### Version History
- **v1.2.0** (Current - January 30, 2025): Complete file-to-vector-store workflow with 21 tools
- **v1.1.0** (January 29, 2025): Universal MCP Server with three deployment options
- **v1.0.1** (December 15, 2024): NPM package improvements and bug fixes
- **v1.0.0** (December 1, 2024): Initial release with Cloudflare Workers deployment

---

**Ready to get started?** Choose your preferred installation method from the [Quick Start](#-quick-start-choose-your-installation-method) guide above or check out the [Universal MCP Server Guide](UNIVERSAL-MCP-SERVER-GUIDE.md) for complete documentation.