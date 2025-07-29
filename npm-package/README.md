# Universal OpenAI Vector Store MCP Server (NPM Package)

A Model Context Protocol (MCP) server that provides comprehensive OpenAI Vector Store operations through stdio transport. This is the **recommended installation method** for most users, offering direct compatibility with Claude Desktop, Roo, and other MCP clients without requiring proxy servers.

## 🌟 Part of the Universal MCP Server Ecosystem

This NPM package is one of **three deployment options** for the Universal OpenAI Vector Store MCP Server:

1. **📦 NPM Package** (This package) - Direct stdio transport, no proxy required
2. **☁️ Cloudflare Workers** - Zero-setup cloud deployment
3. **🔧 Local Development** - Full source code access and customization

Choose the option that best fits your needs. See the [main repository](https://github.com/jezweb/openai-vector-assistant-mcp) for all options.

## ✨ Features

- **15 Vector Store Tools**: Complete OpenAI Vector Store API coverage
- **Direct Stdio Transport**: No proxy servers required - fastest and most reliable
- **Universal Compatibility**: Works with Claude Desktop, Roo, and all MCP clients
- **TypeScript**: Full type safety and modern development experience
- **Zero Dependencies**: Lightweight with minimal runtime footprint
- **Easy Installation**: Simple `npx` usage or global installation
- **Comprehensive Testing**: Built-in test suite for validation
- **Environment Variable Support**: Secure API key management

## Supported Vector Store Operations

### Core Operations
- `vector-store-create` - Create a new vector store
- `vector-store-list` - List all vector stores
- `vector-store-get` - Get details of a specific vector store
- `vector-store-delete` - Delete a vector store
- `vector-store-modify` - Modify a vector store

### File Operations
- `vector-store-file-add` - Add an existing file to a vector store
- `vector-store-file-list` - List files in a vector store
- `vector-store-file-get` - Get details of a specific file
- `vector-store-file-content` - Get content of a specific file
- `vector-store-file-update` - Update metadata of a file
- `vector-store-file-delete` - Delete a file from a vector store

### Batch Operations
- `vector-store-file-batch-create` - Create a file batch for a vector store
- `vector-store-file-batch-get` - Get status of a file batch
- `vector-store-file-batch-cancel` - Cancel a file batch
- `vector-store-file-batch-files` - List files in a file batch

## Installation

### Option 1: NPX (Recommended)
```bash
npx openai-vector-store-mcp
```

### Option 2: Global Installation
```bash
npm install -g openai-vector-store-mcp
openai-vector-store-mcp
```

### Option 3: Local Installation
```bash
npm install openai-vector-store-mcp
npx openai-vector-store-mcp
```

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **OpenAI API Key**: Required for vector store operations

## Configuration

### Environment Variables

Set your OpenAI API key as an environment variable:

```bash
export OPENAI_API_KEY="your-openai-api-key-here"
```

Or provide it when running:

```bash
OPENAI_API_KEY="your-api-key" npx openai-vector-store-mcp
```

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
      "args": ["openai-vector-store-mcp"],
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
      "args": ["openai-vector-store-mcp"],
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
      "args": ["openai-vector-store-mcp"],
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

## Usage Examples

Once configured with Claude Desktop, you can use natural language to interact with vector stores:

### Creating a Vector Store
```
"Create a new vector store called 'Documentation' that expires after 30 days"
```

### Listing Vector Stores
```
"Show me all my vector stores"
```

### Adding Files to a Vector Store
```
"Add file file-abc123 to the Documentation vector store"
```

### Managing Files
```
"List all files in the Documentation vector store"
"Get details about file file-abc123 in the Documentation vector store"
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

#### 1. "OPENAI_API_KEY environment variable is required"
**Solution:**
```bash
# Set environment variable temporarily
export OPENAI_API_KEY="your-openai-api-key-here"

# Or run with inline environment variable
OPENAI_API_KEY="your-key" npx openai-vector-store-mcp

# For permanent setup, add to your shell profile
echo 'export OPENAI_API_KEY="your-key"' >> ~/.bashrc
source ~/.bashrc
```

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
# Test the server independently
OPENAI_API_KEY="your-key" npx openai-vector-store-mcp

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
DEBUG=* OPENAI_API_KEY="your-key" npx openai-vector-store-mcp
```

#### Specific Debug Categories
```bash
# MCP protocol debugging
DEBUG=mcp:* OPENAI_API_KEY="your-key" npx openai-vector-store-mcp

# OpenAI API debugging
DEBUG=openai:* OPENAI_API_KEY="your-key" npx openai-vector-store-mcp

# All debugging
DEBUG=* OPENAI_API_KEY="your-key" npx openai-vector-store-mcp 2>&1 | tee debug.log
```

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