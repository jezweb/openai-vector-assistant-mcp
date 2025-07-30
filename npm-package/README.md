# Universal OpenAI Vector Store MCP Server (NPM Package)

A Model Context Protocol (MCP) server that provides comprehensive OpenAI Vector Store operations and file upload capabilities through stdio transport. This is the **recommended installation method** for most users, offering direct compatibility with Claude Desktop, Roo, and other MCP clients without requiring proxy servers.

**🆕 Phase 2 v1.2.0**: Now includes complete file-to-vector-store workflow with 6 new file management tools, solving real-world scenarios like processing 470 PDF files directly from your local filesystem.

## 🌟 Part of the Universal MCP Server Ecosystem

This NPM package is one of **three deployment options** for the Universal OpenAI Vector Store MCP Server:

1. **📦 NPM Package** (This package) - Direct stdio transport, no proxy required
2. **☁️ Cloudflare Workers** - Zero-setup cloud deployment
3. **🔧 Local Development** - Full source code access and customization

Choose the option that best fits your needs. See the [main repository](https://github.com/jezweb/openai-vector-assistant-mcp) for all options.

## ✨ Features

- **21 Comprehensive Tools**: Complete OpenAI Vector Store API coverage + file upload capabilities
- **🆕 File Upload & Management**: Direct file upload from local filesystem to OpenAI (Phase 2)
- **Complete End-to-End Workflow**: Upload files → Create vector stores → Add files → Query documents
- **Direct Stdio Transport**: No proxy servers required - fastest and most reliable
- **Universal Compatibility**: Works with Claude Desktop, Roo, and all MCP clients
- **Large File Support**: Multipart uploads for files up to 512MB
- **TypeScript**: Full type safety and modern development experience
- **Zero Dependencies**: Lightweight with minimal runtime footprint
- **Easy Installation**: Simple `npx` usage or global installation
- **Comprehensive Testing**: Built-in test suite for validation
- **Environment Variable Support**: Secure API key management

## 🛠️ Available Tools (21 Total)

### Core Vector Store Operations
- `vector-store-create` - Create a new vector store with optional expiration and metadata
- `vector-store-list` - List all vector stores with pagination and sorting
- `vector-store-get` - Get detailed information about a specific vector store
- `vector-store-delete` - Delete a vector store permanently
- `vector-store-modify` - Update vector store name, expiration, or metadata

### 🆕 File Upload & Management Operations (Phase 2)
- `file-upload` - Upload local files directly to OpenAI (CRITICAL - enables end-to-end workflow)
- `file-list` - List all uploaded files with filtering and pagination
- `file-get` - Get detailed information about specific files
- `file-delete` - Remove files from OpenAI storage
- `file-content` - Download and retrieve file content
- `upload-create` - Create multipart uploads for large files (>25MB)

### Vector Store File Operations
- `vector-store-file-add` - Add an existing file to a vector store
- `vector-store-file-list` - List all files in a vector store with filtering
- `vector-store-file-get` - Get details of a specific file in a vector store
- `vector-store-file-content` - Retrieve the content of a file in a vector store
- `vector-store-file-update` - Update file metadata
- `vector-store-file-delete` - Remove a file from a vector store

### Batch Operations
- `vector-store-file-batch-create` - Create a batch operation for multiple files
- `vector-store-file-batch-get` - Get the status of a batch operation
- `vector-store-file-batch-cancel` - Cancel a running batch operation
- `vector-store-file-batch-files` - List files in a batch operation

## Installation

### Option 1: NPX (Recommended)
```bash
npx openai-vector-store-mcp@latest
```

### Option 2: Global Installation
```bash
npm install -g openai-vector-store-mcp@latest
openai-vector-store-mcp
```

### Option 3: Local Installation
```bash
npm install openai-vector-store-mcp@latest
npx openai-vector-store-mcp@latest
```

**💡 Why use @latest?**
- Ensures you get the most recent bug fixes and improvements
- Bypasses NPM cache issues that can cause outdated versions
- Recommended for most reliable experience

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **OpenAI API Key**: Required for vector store operations (configured via MCP client)

## Configuration

### API Key Setup

**Important**: As of version 1.1.1, this package no longer requires environment variables to be set before startup. The API key is provided by your MCP client configuration and validated only when tools are called.

The server will start successfully without an API key and will only validate it when you actually use the vector store tools.

## 🔧 Client Integration

### Claude Desktop Setup

Add the following configuration to your Claude Desktop settings:

#### macOS
Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

#### Windows
Edit `%APPDATA%\Claude\claude_desktop_config.json`:

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

#### Linux
Edit `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": ["openai-vector-store-mcp"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key-here"
      }
    }
  }
}
```

### 🤖 Roo Integration

Roo users get the best experience with this NPM package due to direct stdio transport. Add the following to your Roo configuration:

#### Roo Configuration
Edit your Roo configuration file (typically `~/.config/roo/config.json`):

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

#### Why Roo Users Should Choose This Package

1. **No Proxy Required**: Direct stdio communication is faster and more reliable
2. **Automatic Tool Approval**: The `alwaysAllow` configuration prevents constant permission prompts
3. **Better Performance**: No HTTP overhead or network latency
4. **Simpler Setup**: No need to install or manage `mcp-proxy`
5. **Local Execution**: Full control over the server environment

#### Roo-Specific Features

- **Seamless Integration**: Works out-of-the-box with Roo's MCP implementation
- **Tool Auto-Approval**: Pre-configure all 15 tools to avoid interruptions
- **Environment Variables**: Secure API key management through environment variables
- **Debug Support**: Easy debugging with `DEBUG=*` environment variable
## 🖥️ Claude Code CLI Integration

Claude Code CLI users get excellent performance with this NPM package due to direct stdio transport. Add the MCP server using the command line interface:

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

#### Why Claude Code CLI Users Should Choose This Package

1. **Direct Stdio Transport**: Fastest possible communication with no HTTP overhead
2. **Command-Line Management**: Easy server management with `claude mcp` commands
3. **Flexible Scoping**: Choose between local, project, or user-level configurations
4. **Environment Variable Support**: Secure API key management through environment variables
5. **Team Collaboration**: Share configurations via `.mcp.json` files

---


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

### Vector Store Management
```
# Create a new vector store
"Create a vector store called 'Documentation' that expires after 30 days"

# List vector stores
"Show me all my vector stores"

# Add files to vector stores
"Add file file-abc123 to the Documentation vector store"

# Manage files in vector stores
"List all files in the Documentation vector store"
"Get details about file file-abc123 in the Documentation vector store"
```

### Advanced Workflows
```
# Large file handling
"Create a multipart upload for the file ./large-dataset.zip"
"Upload the large file ./large-dataset.zip using multipart upload"

# Batch operations
"Create a batch to add files file-1, file-2, file-3 to vector store vs_def456"
"Get status of batch batch_abc123 in vector store vs_def456"
```

## Testing

Run the built-in test suite to verify the server is working correctly:

```bash
cd npm-package
npm test
```

The test suite validates:
- Server initialization
- Tool listing (all 15 tools)
- Protocol compliance
- Error handling

## Development

### Building from Source

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the TypeScript code:
   ```bash
   npm run build
   ```
4. Run tests:
   ```bash
   npm test
   ```

### Project Structure

```
npm-package/
├── src/
│   ├── index.ts           # Main server entry point
│   ├── mcp-handler.ts     # MCP protocol handler
│   ├── openai-service.ts  # OpenAI API service
│   └── types.ts           # TypeScript type definitions
├── bin/
│   └── openai-vector-store-mcp.js  # Executable script
├── dist/                  # Compiled JavaScript output
├── test/
│   └── test-stdio.js      # Test suite
└── package.json
```

## Error Handling

The server includes comprehensive error handling:

- **Invalid API Key**: Clear error message with setup instructions
- **Network Issues**: Automatic retry logic for transient failures
- **Invalid Parameters**: Detailed validation error messages
- **OpenAI API Errors**: Proper error code mapping and user-friendly messages

## 🛠️ Troubleshooting

### Common Issues

#### 1. "OPENAI_API_KEY environment variable is required" (when calling tools)
**Solution:**
This error now only appears when you try to use tools without configuring the API key in your MCP client. The server will start successfully without an API key.

Configure your API key in your MCP client configuration (see Client Integration section above).

#### 2. "Failed to start server" or "Command not found"
**Solutions:**
```bash
# Verify Node.js version (requires 18+)
node --version

# Update Node.js if needed (using nvm)
nvm install 18
nvm use 18

# Clear npm cache and reinstall
npm cache clean --force
npm install -g openai-vector-store-mcp

# Test direct execution
npx openai-vector-store-mcp --version
```

#### 3. "Connection timeout" or "Network errors"
**Solutions:**
- Verify internet connectivity
- Check if OpenAI API is accessible: `curl https://api.openai.com/v1/models`
- Test your API key: `curl -H "Authorization: Bearer YOUR_KEY" https://api.openai.com/v1/models`
- Check firewall/proxy settings

#### 4. Roo-Specific Issues

**"Permission denied" or constant approval prompts:**
```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": ["openai-vector-store-mcp"],
      "env": {
        "OPENAI_API_KEY": "your-key"
      },
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

**Tool names not recognized:**
- Ensure exact tool names are used in `alwaysAllow`
- Restart Roo after configuration changes
- Check Roo logs for specific error messages

#### 5. Claude Desktop Issues

**"Server not responding" or "MCP server failed":**
```bash
# Test the server independently (should start without API key)
npx openai-vector-store-mcp

# Check Claude Desktop logs (macOS)
tail -f ~/Library/Logs/Claude/claude_desktop.log

# Verify configuration file syntax
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | python -m json.tool
```

### Platform-Specific Setup

#### macOS
```bash
# Install Node.js via Homebrew
brew install node

# Verify installation
node --version
npm --version

# Install the package
npm install -g openai-vector-store-mcp
```

#### Windows
```bash
# Download Node.js from nodejs.org
# Then install the package
npm install -g openai-vector-store-mcp

# Set environment variable permanently
setx OPENAI_API_KEY "your-key-here"
```

#### Linux (Ubuntu/Debian)
```bash
# Install Node.js
sudo apt update
sudo apt install nodejs npm

# Verify version (upgrade if needed)
node --version

# Install the package
npm install -g openai-vector-store-mcp
```

### Debug Mode

#### Basic Debug
```bash
DEBUG=* npx openai-vector-store-mcp
```

#### Specific Debug Categories
```bash
# MCP protocol debugging
DEBUG=mcp:* npx openai-vector-store-mcp

# OpenAI API debugging
DEBUG=openai:* npx openai-vector-store-mcp

# All debugging
DEBUG=* npx openai-vector-store-mcp 2>&1 | tee debug.log
```

Note: The server will start successfully without an API key. API key validation only occurs when tools are called.

### Performance Optimization

#### For High-Volume Usage
1. **Use Global Installation**: `npm install -g` for faster startup
2. **Environment Variables**: Set `OPENAI_API_KEY` permanently
3. **Local Caching**: Consider local Redis for caching (future feature)
4. **Rate Limiting**: Be aware of OpenAI API rate limits

#### Memory and CPU
- **Memory Usage**: Typically <50MB RAM
- **CPU Usage**: Minimal when idle, scales with request volume
- **Startup Time**: <2 seconds for stdio transport

### Migration from Other Versions

#### From Cloudflare Workers Version
1. **Remove mcp-proxy**: `npm uninstall -g mcp-proxy`
2. **Update Configuration**: Remove proxy URL, add environment variable
3. **Test Connection**: Verify direct stdio communication works

#### From Previous NPM Versions
```bash
# Update to latest version
npm update -g openai-vector-store-mcp

# Clear any cached configurations
rm -rf ~/.npm/_cacache
```

### Getting Additional Help

1. **Check Package Version**: `npm list -g openai-vector-store-mcp`
2. **Verify OpenAI API Access**: Test with official OpenAI tools
3. **Review MCP Client Logs**: Check your MCP client's debug output
4. **Test Isolation**: Run the server standalone to isolate issues
5. **Community Support**: Check the [main repository](https://github.com/jezweb/openai-vector-assistant-mcp) for issues and discussions

## Security Considerations

- **API Key Protection**: Never commit API keys to version control
- **Environment Variables**: Use environment variables for sensitive configuration
- **Network Security**: The server only communicates with OpenAI's official API endpoints
- **Input Validation**: All inputs are validated before processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review the test output for specific error details
- Ensure your OpenAI API key has the necessary permissions for vector store operations

## Related Projects

- [MCP Specification](https://modelcontextprotocol.io/)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference/vector-stores)
- [Claude Desktop](https://claude.ai/desktop)

## 🔧 Enhanced Troubleshooting

### @latest Package Issues

#### When to Use @latest
- **NPM Cache Issues**: If you're getting outdated versions despite updates
- **Version Conflicts**: When pinned versions conflict with dependencies
- **Bug Fixes**: To ensure you have the latest bug fixes and improvements
- **Development**: During active development when frequent updates are expected

```bash
# Clear NPM cache and install latest
npm cache clean --force
npx openai-vector-store-mcp@latest

# Force latest version installation
npm uninstall -g openai-vector-store-mcp
npx openai-vector-store-mcp@latest
```

#### @latest vs Version Pinning Trade-offs

| Aspect | @latest | Pinned Version |
|--------|---------|----------------|
| **Stability** | May introduce breaking changes | Guaranteed consistent behavior |
| **Bug Fixes** | Always includes latest fixes | May miss critical fixes |
| **Security** | Latest security patches | May have known vulnerabilities |
| **Debugging** | Easier to get support | Reproducible issues |
| **Team Sync** | May cause version drift | Everyone uses same version |

**Recommendation**: Use `@latest` for development and testing, pin versions for production.

### Client-Specific Troubleshooting

#### Claude Desktop Issues
- **Server Not Loading**: Check `claude_desktop_config.json` syntax
- **Permission Errors**: Ensure config file is readable
- **API Key Issues**: Verify `OPENAI_API_KEY` environment variable
- **Tool Failures**: Check OpenAI API quota and billing

#### Claude Code CLI Issues
- **Server Not Found**: Run `claude mcp list` to verify installation
- **Scope Problems**: Check if server is in correct scope (local/project/user)
- **Environment Variables**: Ensure `.env` file or system variables are set
- **Project Config**: Verify `.mcp.json` file syntax and permissions

#### Roo Integration Issues
- **Tool Approval**: Add tools to `alwaysAllow` array in config
- **Performance**: Use stdio transport instead of HTTP proxy
- **Debug Mode**: Set `DEBUG=*` environment variable
- **Config Location**: Check `~/.config/roo/config.json` path

### Troubleshooting Matrix

| Issue | Claude Desktop | Claude Code CLI | Roo |
|-------|----------------|-----------------|-----|
| **Server won't start** | Check config.json syntax | `claude mcp get <name>` | Check config.json syntax |
| **API key errors** | Set OPENAI_API_KEY env var | Use `--env` flag or .env | Set in config env section |
| **Permission denied** | Check file permissions | Check scope settings | Add to alwaysAllow |
| **Tool not found** | Restart Claude Desktop | `claude mcp remove && add` | Restart Roo |
| **Slow performance** | Use @latest version | Use stdio transport | Use stdio transport |
| **Version conflicts** | Use `npx @latest` | Use `npx @latest` | Use `npx @latest` |

### Common Solutions

#### NPM and Node.js Issues
```bash
# Update Node.js and NPM
node --version  # Should be 18+
npm --version   # Should be 8+

# Clear all caches
npm cache clean --force
npx clear-npx-cache

# Reinstall with latest
npx openai-vector-store-mcp@latest
```

#### OpenAI API Issues
```bash
# Test API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# Check quota
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/usage
```

#### Environment Variable Issues
```bash
# Check if variable is set
echo $OPENAI_API_KEY

# Set temporarily
export OPENAI_API_KEY="your-key-here"

# Set permanently (add to ~/.bashrc or ~/.zshrc)
echo 'export OPENAI_API_KEY="your-key-here"' >> ~/.bashrc
```

### Best Practices

#### Version Management
- **Development**: Always use `@latest` for newest features and fixes
- **Production**: Pin to specific version after testing
- **Team Projects**: Use `.mcp.json` with pinned versions for consistency
- **CI/CD**: Pin versions in deployment scripts

#### Security
- **API Keys**: Never commit API keys to version control
- **Environment Variables**: Use `.env` files for local development
- **Permissions**: Set appropriate file permissions on config files
- **Rotation**: Regularly rotate API keys

#### Performance
- **Transport**: Use stdio transport when possible (faster than HTTP)
- **Caching**: Leverage NPM cache for faster installs
- **Updates**: Keep packages updated for performance improvements
- **Monitoring**: Monitor API usage and costs

---
