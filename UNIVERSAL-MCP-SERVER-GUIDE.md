# Universal OpenAI Vector Store MCP Server Guide

The complete guide to deploying, configuring, and using the Universal OpenAI Vector Store MCP Server across all platforms and deployment options.

## Table of Contents

1. [Overview](#overview)
2. [Deployment Options](#deployment-options)
3. [Complete Tool Reference](#complete-tool-reference)
4. [Installation Guides](#installation-guides)
5. [Configuration Examples](#configuration-examples)
6. [Usage Examples](#usage-examples)
7. [Performance Comparison](#performance-comparison)
8. [Troubleshooting](#troubleshooting)
9. [Migration Guide](#migration-guide)
10. [Best Practices](#best-practices)

## Overview

The Universal OpenAI Vector Store MCP Server provides comprehensive access to OpenAI's Vector Store API through the Model Context Protocol (MCP). Version 1.2.0 introduces complete file-to-vector-store workflow capabilities, solving real-world scenarios like processing 470 PDF files directly from your local filesystem.

### Key Features

- **21 Comprehensive Tools**: Complete coverage of OpenAI's Vector Store API + file upload capabilities
- **🆕 Complete End-to-End Workflow**: Upload files directly from local filesystem to OpenAI
- **Three Deployment Options**: NPM package, Cloudflare Workers, and local development
- **Universal Compatibility**: Works with Claude Desktop, Roo, and all MCP clients
- **Enhanced Performance**: Direct stdio transport eliminates HTTP overhead
- **Production Ready**: Global edge distribution with 99.9% uptime
- **Large File Support**: Multipart uploads for files up to 512MB
- **Type Safe**: Full TypeScript implementation with comprehensive error handling

### What's New in 1.2.0 (Phase 2)

- **🆕 File Upload & Management**: 6 new tools for complete file-to-vector-store workflow
- **Real-World Problem Solved**: Process hundreds of files directly from local filesystem
- **Large File Support**: Multipart uploads for files >25MB
- **Memory Efficient**: Streaming uploads for optimal performance
- **MIME Type Detection**: Automatic content type detection
- **Complete Pipeline**: Upload → Create Vector Store → Add Files → Query Documents

### Previous Releases

#### Version 1.1.0
- **NPM Package**: Direct stdio transport for maximum performance
- **Enhanced Roo Support**: Complete `alwaysAllow` configuration
- **11 New Tools**: File management and batch operations
- **Platform-Specific Setup**: Detailed instructions for macOS, Windows, Linux
- **Comprehensive Documentation**: Complete setup and troubleshooting guides

## Deployment Options

### 📦 Option 1: NPM Package (Recommended)

**Best for**: Most users, especially Roo users seeking optimal performance

**Advantages**:
- Fastest performance (direct stdio transport)
- No proxy servers required
- Minimal setup complexity
- Local execution and control
- <50MB memory usage

**Installation**:
```bash
# Option A: Direct usage with latest version (recommended)
npx openai-vector-store-mcp@latest

# Option B: Global installation
npm install -g openai-vector-store-mcp@latest

# Option C: Local project installation
npm install openai-vector-store-mcp@latest
```

### ☁️ Option 2: Cloudflare Workers

**Best for**: Users wanting zero-setup cloud deployment

**Advantages**:
- Zero local installation required
- Global edge distribution
- Sub-100ms response times
- 99.9% uptime guarantee
- Automatic scaling

**URL**: `https://vectorstore.jezweb.com`

### 🔧 Option 3: Local Development

**Best for**: Developers and users requiring customization

**Advantages**:
- Full source code access
- Complete customization control
- Private deployment options
- Development and testing capabilities

**Setup**: Clone repository and run locally

## Complete Tool Reference (21 Tools)

### Core Vector Store Operations

#### 1. vector-store-create
Create a new vector store with optional expiration and metadata.

**Parameters**:
- `name` (string, required): Name for the vector store
- `expires_after_days` (number, optional): Days until expiration
- `metadata` (object, optional): Custom metadata

**Example**:
```json
{
  "name": "Project Documentation",
  "expires_after_days": 30,
  "metadata": {
    "project": "web-app",
    "version": "1.0"
  }
}
```

#### 2. vector-store-list
List all vector stores with pagination and sorting.

**Parameters**:
- `limit` (number, optional): Maximum results (default: 20)
- `order` (string, optional): Sort order ("asc" or "desc")

#### 3. vector-store-get
Get detailed information about a specific vector store.

**Parameters**:
- `vector_store_id` (string, required): Vector store ID

#### 4. vector-store-delete
Delete a vector store permanently.

**Parameters**:
- `vector_store_id` (string, required): Vector store ID

#### 5. vector-store-modify
Update vector store name, expiration, or metadata.

**Parameters**:
- `vector_store_id` (string, required): Vector store ID
- `name` (string, optional): New name
- `expires_after_days` (number, optional): New expiration
- `metadata` (object, optional): Updated metadata

### 🆕 File Upload & Management Operations (Phase 2)

#### 6. file-upload
Upload local files directly to OpenAI (CRITICAL - enables end-to-end workflow).

**Parameters**:
- `file_path` (string, required): Local file path
- `purpose` (string, optional): File purpose (default: "assistants")

**Example**:
```json
{
  "file_path": "./documents/report.pdf",
  "purpose": "assistants"
}
```

#### 7. file-list
List all uploaded files with filtering and pagination.

**Parameters**:
- `limit` (number, optional): Maximum results (default: 20)
- `purpose` (string, optional): Filter by purpose

#### 8. file-get
Get detailed information about specific files.

**Parameters**:
- `file_id` (string, required): OpenAI file ID

#### 9. file-delete
Remove files from OpenAI storage.

**Parameters**:
- `file_id` (string, required): OpenAI file ID

#### 10. file-content
Download and retrieve file content.

**Parameters**:
- `file_id` (string, required): OpenAI file ID

#### 11. upload-create
Create multipart uploads for large files (>25MB).

**Parameters**:
- `filename` (string, required): Name of the file
- `purpose` (string, required): File purpose
- `bytes` (number, required): File size in bytes
- `mime_type` (string, required): MIME type of the file

### Vector Store File Operations

#### 12. vector-store-file-add
Add an existing file to a vector store.

**Parameters**:
- `vector_store_id` (string, required): Vector store ID
- `file_id` (string, required): OpenAI file ID

#### 13. vector-store-file-list
List all files in a vector store with filtering.

**Parameters**:
- `vector_store_id` (string, required): Vector store ID
- `limit` (number, optional): Maximum results
- `filter` (string, optional): Status filter ("in_progress", "completed", "failed", "cancelled")

#### 14. vector-store-file-get
Get details of a specific file in a vector store.

**Parameters**:
- `vector_store_id` (string, required): Vector store ID
- `file_id` (string, required): File ID

#### 15. vector-store-file-content
Retrieve the content of a file in a vector store.

**Parameters**:
- `vector_store_id` (string, required): Vector store ID
- `file_id` (string, required): File ID

#### 16. vector-store-file-update
Update file metadata.

**Parameters**:
- `vector_store_id` (string, required): Vector store ID
- `file_id` (string, required): File ID
- `metadata` (object, required): New metadata

#### 17. vector-store-file-delete
Remove a file from a vector store.

**Parameters**:
- `vector_store_id` (string, required): Vector store ID
- `file_id` (string, required): File ID

### Batch Operations

#### 18. vector-store-file-batch-create
Create a batch operation for multiple files.

**Parameters**:
- `vector_store_id` (string, required): Vector store ID
- `file_ids` (array, required): Array of file IDs

#### 19. vector-store-file-batch-get
Get the status of a batch operation.

**Parameters**:
- `vector_store_id` (string, required): Vector store ID
- `batch_id` (string, required): Batch ID

#### 20. vector-store-file-batch-cancel
Cancel a running batch operation.

**Parameters**:
- `vector_store_id` (string, required): Vector store ID
- `batch_id` (string, required): Batch ID

#### 21. vector-store-file-batch-files
List files in a batch operation.

**Parameters**:
- `vector_store_id` (string, required): Vector store ID
- `batch_id` (string, required): Batch ID
- `limit` (number, optional): Maximum results
- `filter` (string, optional): Status filter

## Installation Guides

### NPM Package Installation

#### Prerequisites
- Node.js 18.0.0 or higher
- OpenAI API key with Assistants API access

#### Step-by-Step Installation

1. **Install Node.js** (if not already installed):
   ```bash
   # macOS (using Homebrew)
   brew install node
   
   # Windows: Download from nodejs.org
   # Linux (Ubuntu/Debian)
   sudo apt update && sudo apt install nodejs npm
   ```

2. **Verify Node.js version**:
   ```bash
   node --version  # Should be 18.0.0 or higher
   ```

3. **Install the package**:
   ```bash
   # Global installation (recommended)
   npm install -g openai-vector-store-mcp@latest
   
   # Or use directly with npx (recommended for latest fixes)
   npx openai-vector-store-mcp@latest
   ```

4. **Set up API key**:
   ```bash
   # Option A: Environment variable
   export OPENAI_API_KEY="your-openai-api-key-here"
   
   # Option B: In MCP client configuration
   # (See configuration examples below)
   ```

### Cloudflare Workers Setup

#### Prerequisites
- OpenAI API key with Assistants API access
- Node.js 18+ (for mcp-proxy)

#### Installation Steps

1. **Install MCP proxy**:
   ```bash
   npm install -g mcp-proxy
   ```

2. **Configure your MCP client** with the Cloudflare Workers URL:
   ```
   https://vectorstore.jezweb.com/mcp/YOUR_OPENAI_API_KEY_HERE
   ```

### Local Development Setup

#### Prerequisites
- Node.js 18.0.0 or higher
- Git
- OpenAI API key

#### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jezweb/openai-vector-assistant-mcp.git
   cd openai-vector-assistant-mcp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   # Add your OpenAI API key
   wrangler secret put OPENAI_API_KEY
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## Configuration Examples

### Claude Desktop Configuration

#### NPM Package Configuration

**macOS** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
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

**Windows** (`%APPDATA%\Claude\claude_desktop_config.json`):
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

**Linux** (`~/.config/Claude/claude_desktop_config.json`):
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

#### Cloudflare Workers Configuration

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

### Claude Code CLI Configuration

Claude Code CLI provides excellent performance with direct stdio transport and flexible scoping options.

#### Basic Setup Commands

```bash
# Add with local scope (default - current project only)
claude mcp add openai-vector-store -- npx openai-vector-store-mcp@latest --env OPENAI_API_KEY="your-openai-api-key-here"

# Add with project scope (shared via .mcp.json)
claude mcp add --scope project openai-vector-store -- npx openai-vector-store-mcp@latest --env OPENAI_API_KEY="your-openai-api-key-here"

# Add with user scope (available across all projects)
claude mcp add --scope user openai-vector-store -- npx openai-vector-store-mcp@latest --env OPENAI_API_KEY="your-openai-api-key-here"
```

#### Project-Level Configuration (.mcp.json)

When using `--scope project`, Claude Code creates a `.mcp.json` file:

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

#### Management Commands

```bash
# List configured servers
claude mcp list

# Get server details
claude mcp get openai-vector-store

# Remove server
claude mcp remove openai-vector-store

# Check server status in Claude Code
/mcp
```

### Roo Configuration

#### NPM Package Configuration (Recommended for Roo)

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

#### Cloudflare Workers Configuration

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

## Usage Examples

### Basic Vector Store Management

#### Creating a Vector Store
```
"Create a vector store named 'Customer Support Knowledge Base' that expires in 90 days with metadata indicating it's for customer service"
```

#### Listing Vector Stores
```
"List all my vector stores, showing the most recently created first"
```

#### Getting Vector Store Details
```
"Get detailed information about vector store vs_abc123, including its current status and metadata"
```

#### Modifying a Vector Store
```
"Update vector store vs_abc123 to expire in 180 days and change its name to 'Updated Knowledge Base'"
```

### File Management Operations

#### Adding Files to Vector Stores
```
"Add file file-xyz789 to vector store vs_abc123"
```

#### Listing Files in a Vector Store
```
"List all files in vector store vs_abc123, showing only completed files"
```

#### Getting File Information
```
"Get details about file file-xyz789 in vector store vs_abc123"
```

#### Retrieving File Content
```
"Get the content of file file-xyz789 from vector store vs_abc123"
```

#### Updating File Metadata
```
"Update the metadata for file file-xyz789 in vector store vs_abc123 to include tags: documentation, api-reference"
```

### Batch Operations

#### Creating Batch Operations
```
"Create a batch operation to add files file-001, file-002, file-003, file-004, and file-005 to vector store vs_abc123"
```

#### Monitoring Batch Status
```
"Check the status of batch operation batch_def456 in vector store vs_abc123"
```

#### Managing Batch Operations
```

### @latest Package Troubleshooting

#### When to Use @latest
- **NPM Cache Issues**: When cached versions are outdated despite updates
- **Version Conflicts**: When pinned versions conflict with dependencies  
- **Bug Fixes**: To ensure you have the latest bug fixes and security patches
- **Development**: During active development when frequent updates are expected

#### @latest vs Version Pinning

| Aspect | @latest | Pinned Version |
|--------|---------|----------------|
| **Stability** | May introduce breaking changes | Guaranteed consistent behavior |
| **Bug Fixes** | Always includes latest fixes | May miss critical fixes |
| **Security** | Latest security patches | May have known vulnerabilities |
| **Team Sync** | May cause version drift | Everyone uses same version |
| **Debugging** | Easier to get support | Reproducible issues |

**Recommendation**: Use `@latest` for development and testing, pin versions for production.

#### @latest Installation Issues

```bash
# Clear NPM cache and install latest
npm cache clean --force
npx openai-vector-store-mcp@latest

# Force latest version installation
npm uninstall -g openai-vector-store-mcp
npm install -g openai-vector-store-mcp@latest

# Check installed version
npm list -g openai-vector-store-mcp
```

### Claude Code CLI Troubleshooting

#### Server Management Issues

**Issue**: Server not found after installation
```bash
# Check if server is installed
claude mcp list

# Reinstall if missing
claude mcp remove openai-vector-store
claude mcp add openai-vector-store -- npx openai-vector-store-mcp@latest --env OPENAI_API_KEY="your-key"
```

**Issue**: Scope configuration problems
```bash
# Check current scope
claude mcp get openai-vector-store

# Change scope if needed
claude mcp remove openai-vector-store
claude mcp add --scope project openai-vector-store -- npx openai-vector-store-mcp@latest --env OPENAI_API_KEY="your-key"
```

**Issue**: Environment variable not recognized
```bash
# Check if environment variable is set
echo $OPENAI_API_KEY

# Set in shell profile for user scope
echo 'export OPENAI_API_KEY="your-key"' >> ~/.bashrc
source ~/.bashrc

# Or use .env file for project scope
echo "OPENAI_API_KEY=your-key" > .env
```

#### Project Configuration Issues

**Issue**: .mcp.json file not created
- Ensure you used `--scope project` when adding the server
- Check file permissions in project directory
- Verify Claude Code has write access to project root

**Issue**: Environment variable expansion not working
```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": ["openai-vector-store-mcp@latest"],
      "env": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY:-your-fallback-key}"
      }
    }
  }
}
```

### Client-Specific Troubleshooting Matrix

| Issue | Claude Desktop | Claude Code CLI | Roo |
|-------|----------------|-----------------|-----|
| **Server won't start** | Check config.json syntax | `claude mcp get <name>` | Check config.json syntax |
| **API key errors** | Set OPENAI_API_KEY env var | Use `--env` flag or .env | Set in config env section |
| **Permission denied** | Check file permissions | Check scope settings | Add to alwaysAllow |
| **Tool not found** | Restart Claude Desktop | `claude mcp remove && add` | Restart Roo |
| **Slow performance** | Use @latest version | Use stdio transport | Use stdio transport |
| **Version conflicts** | Use `npx @latest` | Use `npx @latest` | Use `npx @latest` |
| **Cache issues** | Clear NPM cache | Clear NPM cache | Clear NPM cache |
| **Environment vars** | Set in config file | Use --env or .env | Set in config file |

"Cancel the batch operation batch_def456 in vector store vs_abc123"
```

#### Listing Batch Files
```
"List all files in batch operation batch_def456 for vector store vs_abc123"
```

### Advanced Workflows

#### Document Processing Pipeline
1. Create a project-specific vector store
2. Upload documents using OpenAI's file API
3. Add files to the vector store using batch operations
4. Monitor batch processing status
5. Use the vector store for retrieval-augmented generation
6. Clean up by deleting the vector store when done

#### Multi-Project Management
1. List all existing vector stores to see current projects
2. Create new vector stores for new projects with appropriate metadata
3. Organize files by project using different vector stores
4. Use metadata to track project status and ownership
5. Implement automated cleanup based on expiration dates

## Performance Comparison

### Response Time Analysis

| Deployment Option | Typical Response Time | Best Use Case |
|-------------------|----------------------|---------------|
| **NPM Package** | 10-50ms | High-frequency operations, Roo users |
| **Cloudflare Workers** | 50-100ms | Global distribution, zero setup |
| **Local Development** | 5-30ms | Development, customization |

### Resource Usage

| Deployment Option | Memory Usage | CPU Usage | Network Dependency |
|-------------------|--------------|-----------|-------------------|
| **NPM Package** | <50MB | Minimal | OpenAI API only |
| **Cloudflare Workers** | N/A (serverless) | N/A (serverless) | Internet required |
| **Local Development** | 50-100MB | Low-Medium | OpenAI API only |

### Scalability

| Deployment Option | Concurrent Users | Rate Limiting | Availability |
|-------------------|------------------|---------------|--------------|
| **NPM Package** | Per-machine | OpenAI API limits | Local uptime |
| **Cloudflare Workers** | Unlimited | OpenAI API limits | 99.9% SLA |
| **Local Development** | Per-machine | OpenAI API limits | Local uptime |

## Troubleshooting

### Common Issues and Solutions

#### NPM Package Issues

**Issue**: "OPENAI_API_KEY environment variable is required"
```bash
# Solution 1: Set environment variable
export OPENAI_API_KEY="your-key"

# Solution 2: Use configuration file
# Add to MCP client config:
"env": {
  "OPENAI_API_KEY": "your-key"
}
```

**Issue**: "Command not found: openai-vector-store-mcp"
```bash
# Solution: Install the package with latest version
npm install -g openai-vector-store-mcp@latest

# Or use npx directly (recommended)
npx openai-vector-store-mcp@latest
```

**Issue**: Node.js version compatibility
```bash
# Check version
node --version

# Update if needed (using nvm)
nvm install 18
nvm use 18
```

#### Cloudflare Workers Issues

**Issue**: "Server not found" or "Connection failed"
```bash
# Test server directly
curl -X POST "https://vectorstore.jezweb.com/mcp/YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# Install mcp-proxy if missing
npm install -g mcp-proxy
```

**Issue**: Authentication errors
- Verify API key is correct and has Assistants API access
- Check for extra spaces or characters in the API key
- Ensure API key is properly embedded in the URL

#### Roo-Specific Issues

**Issue**: Permission denied or constant approval prompts
- Ensure all 15 tools are in the `alwaysAllow` array
- Use exact tool names as listed in documentation
- Restart Roo after configuration changes

**Issue**: Tool names not recognized
- Copy the complete `alwaysAllow` array from examples
- Verify JSON syntax is correct
- Check Roo logs for specific error messages

### Debug Mode

#### NPM Package Debug
```bash
DEBUG=* OPENAI_API_KEY="your-key" npx openai-vector-store-mcp@latest
```

#### Cloudflare Workers Debug
```bash
curl -v -X POST "https://vectorstore.jezweb.com/mcp/YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

#### Local Development Debug
```bash
DEBUG=* npm run dev
```

### Platform-Specific Debugging

#### macOS
```bash
# Check configuration file
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | python -m json.tool

# View Claude Desktop logs
tail -f ~/Library/Logs/Claude/claude_desktop.log
```

#### Windows
```bash
# Check configuration file
type %APPDATA%\Claude\claude_desktop_config.json

# Set environment variable permanently
setx OPENAI_API_KEY "your-key"
```

#### Linux
```bash
# Check configuration file
cat ~/.config/Claude/claude_desktop_config.json | python -m json.tool

# View system logs
journalctl -f
```

## Migration Guide

### From Version 1.0.x to 1.1.0

#### Automatic Compatibility
- All existing configurations continue to work
- No breaking changes in tool names or parameters
- New tools are automatically available

#### Recommended Upgrades

1. **For Roo Users**: Switch to NPM package for optimal performance
2. **For All Users**: Add new tools to `alwaysAllow` configuration
3. **For Developers**: Consider local development setup

#### Configuration Updates

**Add new tools to Roo configuration**:
```json
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
```

### From Other MCP Servers

#### From Basic Vector Store Implementations
1. Update configuration to use Universal MCP Server
2. Take advantage of 15 comprehensive tools
3. Implement batch operations for efficiency
4. Use enhanced error handling and debugging

#### From Custom Implementations
1. Compare feature coverage with Universal MCP Server
2. Migrate configurations to standard format
3. Test all tools for compatibility
4. Update documentation and workflows

## Best Practices

### Deployment Selection

#### Choose NPM Package When:
- Using Roo as your MCP client
- Performance is critical
- You want minimal network dependencies
- Local execution is preferred

#### Choose Cloudflare Workers When:
- You want zero local setup
- Global distribution is important
- High availability is required
- You prefer managed infrastructure

#### Choose Local Development When:
- You need source code access
- Customization is required
- You're contributing to the project
- Private deployment is necessary

### Configuration Management

#### Security Best Practices
1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive data
3. **Rotate API keys** regularly
4. **Monitor API usage** for unusual activity

#### Performance Optimization
1. **Use NPM package** for highest performance
2. **Configure `alwaysAllow`** for Roo to avoid prompts
3. **Implement batch operations** for multiple files
4. **Monitor OpenAI API rate limits**

#### Maintenance
1. **Keep packages updated** to latest versions
2. **Monitor server logs** for errors
3. **Test configurations** after changes
4. **Document custom setups** for team members

### Usage Patterns

#### Efficient Vector Store Management
1. **Use descriptive names** and metadata for organization
2. **Set appropriate expiration dates** to manage storage
3. **Implement cleanup workflows** for old vector stores
4. **Monitor file processing status** in batch operations

#### Error Handling
1. **Implement retry logic** for transient failures
2. **Validate inputs** before making API calls
3. **Handle rate limiting** gracefully
4. **Log errors** for debugging

#### Workflow Integration
1. **Automate vector store creation** for new projects
2. **Use metadata** for project tracking
3. **Implement approval workflows** for deletions
4. **Monitor storage usage** and costs

---

## Support and Resources

### Documentation
- [Main README](README.md) - Quick start and overview
- [Client Setup Guide](CLIENT-SETUP-GUIDE.md) - Detailed setup instructions
- [NPM Package README](npm-package/README.md) - NPM-specific documentation
- [Changelog](CHANGELOG.md) - Version history and updates

### Community
- [GitHub Repository](https://github.com/jezweb/openai-vector-assistant-mcp) - Source code and issues
- [MCP Specification](https://modelcontextprotocol.io/) - Protocol documentation
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference/vector-stores) - Vector Store API reference

### Getting Help
1. Check this guide for common solutions
2. Review troubleshooting sections
3. Test with debug mode enabled
4. Search existing GitHub issues
5. Create new issue with detailed information

---

This completes the Universal MCP Server Guide. Choose the deployment option that best fits your needs and follow the corresponding setup instructions for optimal performance and reliability.