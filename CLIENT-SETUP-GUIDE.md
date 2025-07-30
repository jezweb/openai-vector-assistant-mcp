# Universal MCP Client Setup Guide

This comprehensive guide provides step-by-step instructions for configuring and testing the Universal OpenAI Vector Store MCP server with different MCP clients across all three deployment options.

## 🌟 Universal MCP Server - Three Deployment Options

Choose the deployment option that best fits your needs:

### 📦 Option 1: NPM Package (Recommended)
- **Package**: `openai-vector-store-mcp`
- **Transport**: Direct stdio (fastest and most reliable)
- **Setup**: Simple `npx` command
- **Best for**: Most users, especially Roo users

### ☁️ Option 2: Cloudflare Workers
- **Production URL**: `https://vectorstore.jezweb.com`
- **Transport**: HTTP via `mcp-proxy`
- **Setup**: Zero installation required
- **Best for**: Users who prefer cloud deployment

### 🔧 Option 3: Local Development
- **Source**: Clone and build locally
- **Transport**: HTTP (local server)
- **Setup**: Full development environment
- **Best for**: Developers and customization

## 🛠️ Available Tools

All deployment options provide **15 comprehensive vector store management tools**:

### Core Operations
1. **vector-store-create** - Create a new vector store with metadata and expiration
2. **vector-store-list** - List all vector stores with pagination
3. **vector-store-get** - Get detailed information about a specific vector store
4. **vector-store-delete** - Delete a vector store permanently
5. **vector-store-modify** - Update vector store name, expiration, or metadata

### File Management
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

## Prerequisites

1. **OpenAI API Key**: You need a valid OpenAI API key with access to the Assistants API
2. **Node.js**: Version 18.0.0 or higher (required for NPM package and local development)
3. **MCP Client**: Claude Desktop, Roo, or other MCP-compatible client

## 🔑 Getting Started with OpenAI

Before configuring your MCP client, ensure you have proper OpenAI access:

### 1. **Obtain Your OpenAI API Key**
- Visit the [OpenAI API Keys page](https://platform.openai.com/api-keys)
- Create a new API key or use an existing one
- Copy your API key (starts with `sk-proj-` or `sk-`)
- **Important**: Keep your API key secure and never share it publicly

### 2. **Monitor Your Vector Stores**
- Access your [OpenAI Storage Dashboard](https://platform.openai.com/storage)
- View all your vector stores, file counts, and storage usage
- Monitor expiration dates and storage limits
- Track costs and usage patterns

### 3. **Verify API Access and Limits**
- Check your [OpenAI Usage Dashboard](https://platform.openai.com/usage) for current usage
- Review your account's API limits and quotas
- Ensure you have access to the Assistants API (required for vector stores)
- Understand [OpenAI Pricing](https://openai.com/pricing) for vector store operations

### 4. **Understanding Vector Store Costs**
- **Storage**: Charged per GB per day for stored files
- **Processing**: Charged for file processing and indexing
- **Retrieval**: Charged for search and retrieval operations
- **Free Tier**: Limited vector store usage available

### 📚 **Essential OpenAI Resources**
- [Vector Stores Documentation](https://platform.openai.com/docs/assistants/tools/file-search) - Complete guide to vector stores
- [Assistants API Overview](https://platform.openai.com/docs/assistants/overview) - Understanding the Assistants API
- [File Upload Guide](https://platform.openai.com/docs/api-reference/files) - How to upload files for vector stores
- [OpenAI Community](https://community.openai.com/) - Get help and share experiences

### 🛡️ **Security Best Practices**
- Store API keys in environment variables, never in code
- Use different API keys for development and production
- Regularly rotate your API keys
- Monitor your API usage for unexpected activity
- Set up usage alerts in your OpenAI dashboard

---

## 📦 Option 1: NPM Package Setup (Recommended)

### Why Choose the NPM Package?
- **Fastest Performance**: Direct stdio transport with no HTTP overhead
- **Most Reliable**: No network dependencies or proxy servers
- **Easiest for Roo**: Best integration with Roo's MCP implementation
- **Simplest Setup**: No additional dependencies beyond Node.js

### Installation

```bash
# Option A: Use directly with npx (recommended for latest fixes)
npx openai-vector-store-mcp@latest

# Option B: Install globally for faster startup
npm install -g openai-vector-store-mcp@latest

# Option C: Install locally in your project
npm install openai-vector-store-mcp@latest
```

**💡 Why use @latest?**
- Ensures you get the most recent bug fixes and improvements
- Bypasses NPM cache issues that can cause outdated versions
- Recommended for most reliable experience

### Claude Desktop Configuration

Add to your Claude Desktop configuration file:

**Configuration File Locations:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

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

Add to your Roo configuration file (typically `~/.config/roo/config.json`):

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

---

## 🖥️ Claude Code CLI Setup

### Why Choose Claude Code CLI?
- **Command-line interface**: Perfect for developers who prefer CLI tools
- **Multiple scope options**: Local, project, or user-level configurations
- **Environment variable expansion**: Supports `${VAR}` syntax in configurations
- **Project collaboration**: Share configurations via `.mcp.json` files
- **Built-in management**: Easy server management with `claude mcp` commands

### Prerequisites

- Claude Code CLI installed and configured
- Node.js 18+ (for NPM package execution)
- OpenAI API key with Assistants API access

### Basic Setup

```bash
# Add the MCP server with local scope (default - available only in current project)
claude mcp add openai-vector-store -- npx openai-vector-store-mcp@latest --env OPENAI_API_KEY="your-openai-api-key-here"

# Add with project scope (shared with team via .mcp.json file)
claude mcp add --scope project openai-vector-store -- npx openai-vector-store-mcp@latest --env OPENAI_API_KEY="your-openai-api-key-here"

# Add with user scope (available across all your projects)
claude mcp add --scope user openai-vector-store -- npx openai-vector-store-mcp@latest --env OPENAI_API_KEY="your-openai-api-key-here"
```

### Understanding Scopes

#### Local Scope (Default)
- **Usage**: `claude mcp add openai-vector-store ...` or `--scope local`
- **Availability**: Only in the current project directory
- **Storage**: Project-specific user settings
- **Best for**: Personal development, experimental configurations, sensitive credentials

#### Project Scope
- **Usage**: `--scope project`
- **Availability**: Shared with all team members via `.mcp.json` file
- **Storage**: `.mcp.json` in project root (version controlled)
- **Best for**: Team collaboration, project-specific tools, shared configurations

#### User Scope
- **Usage**: `--scope user`
- **Availability**: Available across all your projects
- **Storage**: User-level configuration
- **Best for**: Personal utilities, development tools, frequently-used services

### Managing MCP Servers

```bash
# List all configured servers
claude mcp list

# Get details for a specific server
claude mcp get openai-vector-store

# Remove a server
claude mcp remove openai-vector-store

# Check server status within Claude Code
/mcp

# Reset project choices (if needed)
claude mcp reset-project-choices
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

#### Environment Variable Expansion

Claude Code supports powerful environment variable expansion:

```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": ["openai-vector-store-mcp@latest"],
      "env": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY}",
        "DEBUG": "${DEBUG:-false}",
        "NODE_ENV": "${NODE_ENV:-production}"
      }
    }
  }
}
```

**Supported syntax:**
- `${VAR}` - Expands to the value of environment variable `VAR`
- `${VAR:-default}` - Expands to `VAR` if set, otherwise uses `default`

### Advanced Configuration

#### Multiple Environment Setup

```bash
# Development environment
claude mcp add --scope local openai-vector-store-dev -- npx openai-vector-store-mcp@latest --env OPENAI_API_KEY="${DEV_OPENAI_API_KEY}"

# Production environment
claude mcp add --scope user openai-vector-store-prod -- npx openai-vector-store-mcp@latest --env OPENAI_API_KEY="${PROD_OPENAI_API_KEY}"
```

#### Team Collaboration Workflow

1. **Project Lead**: Add server with project scope
   ```bash
   claude mcp add --scope project openai-vector-store -- npx openai-vector-store-mcp@latest --env OPENAI_API_KEY="${OPENAI_API_KEY}"
   ```

2. **Team Members**: Clone repository and set environment variable
   ```bash
   export OPENAI_API_KEY="your-team-api-key"
   # Server automatically available via .mcp.json
   ```

3. **Verify Setup**: Check server status
   ```bash
   claude mcp list
   /mcp  # Within Claude Code
   ```

### Troubleshooting Claude Code CLI

#### Server Not Connecting
```bash
# Check server status
claude mcp list
claude mcp get openai-vector-store

# Re-add with @latest
claude mcp remove openai-vector-store
claude mcp add openai-vector-store -- npx openai-vector-store-mcp@latest --env OPENAI_API_KEY="your-key"
```

#### Scope-Related Issues
```bash
# Check which scope the server is in
claude mcp list

# Move to different scope
claude mcp remove openai-vector-store
claude mcp add --scope user openai-vector-store -- npx openai-vector-store-mcp@latest --env OPENAI_API_KEY="your-key"
```

#### Project .mcp.json Issues
```bash
# Reset project choices if needed
claude mcp reset-project-choices

# Verify .mcp.json syntax
cat .mcp.json | python -m json.tool

# Check environment variable expansion
echo $OPENAI_API_KEY
```

#### Permission and Authentication Issues
```bash
# Verify environment variable is set
echo $OPENAI_API_KEY

# Test server directly
OPENAI_API_KEY="your-key" npx openai-vector-store-mcp@latest

# Check Claude Code logs
# (Location varies by system)
```

---

## ☁️ Option 2: Cloudflare Workers Setup

### Why Choose Cloudflare Workers?
- **Zero Setup**: No local installation required
- **Global Performance**: Deployed on Cloudflare's edge network
- **Always Available**: 99.9% uptime with automatic scaling
- **No Maintenance**: Fully managed cloud deployment

### Prerequisites

Install the MCP proxy package:

```bash
npm install -g mcp-proxy
```

### Claude Desktop Configuration

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

---

## 🔧 Option 3: Local Development Setup

### Why Choose Local Development?
- **Full Control**: Complete access to source code and customization
- **Development**: Perfect for contributing or extending functionality
- **Privacy**: All processing happens locally
- **Customization**: Modify the server to fit specific needs

### Setup Steps

1. **Clone the repository:**
```bash
git clone https://github.com/jezweb/openai-vector-assistant-mcp.git
cd openai-vector-assistant-mcp
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
# Add your OpenAI API key to wrangler.toml or use wrangler secrets
wrangler secret put OPENAI_API_KEY
```

4. **Start development server:**
```bash
npm run dev
```

### Configuration

Use your local server URL (typically `http://localhost:8787`) in your MCP client configuration:

**For Claude Desktop:**
```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": [
        "mcp-proxy",
        "http://localhost:8787/mcp/YOUR_OPENAI_API_KEY_HERE"
      ]
    }
  }
}
```

**For Roo:**
```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": [
        "mcp-proxy",
        "http://localhost:8787/mcp/YOUR_OPENAI_API_KEY_HERE"
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

---

## 🔄 Configuration Notes

### Important Setup Steps

1. **Replace API Key**: Always replace `YOUR_OPENAI_API_KEY_HERE` with your actual OpenAI API key
2. **Restart Client**: Restart your MCP client after configuration changes
3. **Roo Users**: The `alwaysAllow` array is crucial for Roo to automatically approve tool usage
4. **Security**: Never commit your API key to version control

### Choosing the Right Option

| Feature | NPM Package | Cloudflare Workers | Local Development |
|---------|-------------|-------------------|-------------------|
| **Setup Complexity** | Simple | Simple | Moderate |
| **Performance** | Fastest | Fast | Fast |
| **Reliability** | Highest | High | Depends on setup |
| **Customization** | Limited | None | Full |
| **Maintenance** | Minimal | None | Self-managed |
| **Best for** | Most users, Roo | Zero-setup needs | Developers |

## Testing the Integration

### Basic Connectivity Test

Once configured, test the integration with these steps:

#### 1. Check Server Connection

Ask your MCP client to list available tools. You should see the 4 vector store tools listed.

**Example request**: "What MCP tools are available?"

**Expected response**: The client should list the vector store tools (create, list, get, delete).

#### 2. Test Tool Listing

Try listing existing vector stores:

**Example request**: "List my vector stores"

**Expected response**: A list of your existing vector stores (may be empty if none exist).

#### 3. Test Vector Store Creation

Create a test vector store:

**Example request**: "Create a vector store named 'Test Store' that expires in 1 day"

**Expected response**: Details of the newly created vector store with an ID.

#### 4. Test Vector Store Retrieval

Get details of the created vector store:

**Example request**: "Get details of vector store [ID from previous step]"

**Expected response**: Full details of the vector store including metadata.

#### 5. Test Vector Store Deletion

Clean up by deleting the test vector store:

**Example request**: "Delete vector store [ID from creation step]"

**Expected response**: Confirmation that the vector store was deleted.

### Advanced Testing

#### Concurrent Operations

Test multiple operations in sequence:

1. Create multiple vector stores
2. List all vector stores
3. Get details of specific stores
4. Delete selected stores

#### Error Handling

Test error scenarios:

1. Try to get a non-existent vector store ID
2. Try to delete an already deleted vector store
3. Create a vector store with invalid parameters

## Troubleshooting

### Common Issues

#### 1. "Server not found" or "Connection failed"

**Symptoms**: MCP client cannot connect to the server
**Solutions**:
- Verify your OpenAI API key is correct and has Assistants API access
- Check that `mcp-proxy` is installed
- Ensure the URL in your configuration is exactly: `https://vectorstore.jezweb.com/mcp/YOUR_API_KEY`

#### 2. "Authentication failed" or "Invalid API key"

**Symptoms**: Server responds with authentication errors
**Solutions**:
- Verify your OpenAI API key is valid and active
- Check that your API key has access to the Assistants API
- Ensure there are no extra spaces or characters in your API key

#### 3. "Tools not available" or "No MCP tools found"

**Symptoms**: MCP client doesn't show the vector store tools
**Solutions**:
- Restart your MCP client after configuration changes
- Check the configuration file syntax is valid JSON
- Verify the configuration file is in the correct location

#### 4. "Permission denied" (Roo specific)

**Symptoms**: Roo blocks tool execution
**Solutions**:
- Ensure `alwaysAllow` is configured for all 4 tools
- Check that tool names in `alwaysAllow` match exactly
- Restart Roo after configuration changes

### Debugging Steps

#### 1. Verify Configuration

Check your configuration file syntax:

```bash
# For JSON validation
cat your-config-file.json | python -m json.tool
```

#### 2. Test Direct API Access

Test the server directly with curl:

```bash
curl -X POST "https://vectorstore.jezweb.com/mcp/YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

Expected response should include the 4 vector store tools.

#### 3. Check Network Connectivity

Ensure you can reach the server:

```bash
curl -I https://vectorstore.jezweb.com
```

#### 4. Verify Dependencies

Check that the MCP proxy is available:

```bash
npx mcp-proxy --version
```

### Getting Help

If you continue to experience issues:

1. Check the MCP client logs for detailed error messages
2. Verify your OpenAI API key works with other OpenAI services
3. Test with a minimal configuration first, then add complexity
4. Ensure you're using the latest version of your MCP client

## Security Considerations

1. **API Key Protection**: Never commit your OpenAI API key to version control
2. **Access Control**: The server uses your OpenAI API key, so it has the same permissions as your key
3. **Rate Limits**: Be aware of OpenAI API rate limits when using the tools
4. **Data Privacy**: Vector stores created through this server are stored in your OpenAI account

## Example Usage Scenarios

### Document Processing Workflow

1. Create a vector store for a specific project
2. Use OpenAI's file upload API to add documents
3. Use the vector store for retrieval-augmented generation
4. Clean up by deleting the vector store when done

### Multi-Project Management

1. List all existing vector stores to see current projects
2. Create new vector stores for new projects
3. Get details of specific stores to check status and metadata
4. Delete completed project stores to manage storage

### Automated Cleanup

1. List all vector stores
2. Check metadata for expiration dates or project status
3. Delete stores that are no longer needed
4. Verify deletion was successful

This completes the setup and testing guide for the OpenAI Vector Store MCP server integration.

## 🧪 Testing the Integration

### Basic Connectivity Test

Once configured, test the integration with these comprehensive steps:

#### 1. Check Server Connection

Ask your MCP client to list available tools. You should see **all 15 vector store tools** listed.

**Example request**: "What MCP tools are available?"

**Expected response**: The client should list all 15 vector store tools including core operations, file management, and batch operations.

#### 2. Test Core Operations

**List existing vector stores:**
```
"List my vector stores"
```

**Create a test vector store:**
```
"Create a vector store named 'Test Store' that expires in 1 day with metadata purpose: testing"
```

**Get vector store details:**
```
"Get details of vector store [ID from previous step]"
```

**Modify the vector store:**
```
"Update vector store [ID] to expire in 7 days and change name to 'Updated Test Store'"
```

#### 3. Test File Operations

**Add a file to the vector store:**
```
"Add file [file-id] to vector store [vector-store-id]"
```

**List files in the vector store:**
```
"List all files in vector store [vector-store-id]"
```

**Get file details:**
```
"Get details of file [file-id] in vector store [vector-store-id]"
```

**Get file content:**
```
"Get the content of file [file-id] in vector store [vector-store-id]"
```

#### 4. Test Batch Operations

**Create a batch operation:**
```
"Create a batch to add files [file-1], [file-2], [file-3] to vector store [vector-store-id]"
```

**Check batch status:**
```
"Get status of batch [batch-id] in vector store [vector-store-id]"
```

**List files in batch:**
```
"List files in batch [batch-id] for vector store [vector-store-id]"
```

#### 5. Clean Up

**Delete the test vector store:**
```
"Delete vector store [ID from creation step]"
```

### Advanced Testing

#### Performance Testing

Test different deployment options for performance:

1. **NPM Package**: Should have the fastest response times (direct stdio)
2. **Cloudflare Workers**: Should have consistent sub-100ms responses
3. **Local Development**: Response times depend on local setup

#### Concurrent Operations

Test multiple operations in sequence:

1. Create multiple vector stores with different configurations
2. List all vector stores and verify pagination
3. Add multiple files to different vector stores
4. Create batch operations for bulk file management
5. Get details of specific stores and files
6. Delete selected stores and verify cleanup

#### Error Handling

Test error scenarios across all tools:

1. **Invalid IDs**: Try to get non-existent vector store or file IDs
2. **Already Deleted**: Try to delete an already deleted vector store
3. **Invalid Parameters**: Create vector stores with invalid expiration dates
4. **Permission Issues**: Test with invalid API keys
5. **Rate Limiting**: Test rapid successive calls

## 🛠️ Troubleshooting

### Common Issues by Deployment Option

#### NPM Package Issues

**"OPENAI_API_KEY environment variable is required"**
```bash
# Set environment variable in configuration
export OPENAI_API_KEY="your-key"

# Or add to your MCP client configuration
"env": {
  "OPENAI_API_KEY": "your-openai-api-key-here"
}
```

**"Command not found: openai-vector-store-mcp"**
```bash
# Install the package globally
npm install -g openai-vector-store-mcp

# Or use npx directly
npx openai-vector-store-mcp
```

**"Node.js version too old"**
```bash
# Check Node.js version (requires 18+)
node --version

# Update Node.js if needed
nvm install 18
nvm use 18
```

#### Cloudflare Workers Issues

**"Server not found" or "Connection failed"**
```bash
# Test the server directly
curl -X POST "https://vectorstore.jezweb.com/mcp/YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# Install mcp-proxy if missing
npm install -g mcp-proxy
```

**"Authentication failed"**
- Verify your OpenAI API key is correct and has Assistants API access
- Ensure the API key is properly embedded in the URL
- Check for extra spaces or characters in the API key

#### Local Development Issues

**"Server not running"**
```bash
# Start the development server
npm run dev

# Check if server is accessible
curl -X POST "http://localhost:8787/mcp/YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

**"Dependencies not installed"**
```bash
# Install all dependencies
npm install

# Build the project
npm run build
```

### Client-Specific Issues

#### Claude Desktop

**"MCP server failed to start"**
```bash
# Check Claude Desktop logs (macOS)
tail -f ~/Library/Logs/Claude/claude_desktop.log

# Verify configuration file syntax
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | python -m json.tool
```

**"Tools not appearing"**
- Restart Claude Desktop after configuration changes
- Verify the configuration file is in the correct location
- Check that the JSON syntax is valid

#### Roo

**"Permission denied" or constant approval prompts**
- Ensure all 15 tools are listed in the `alwaysAllow` array
- Use exact tool names as listed in the documentation
- Restart Roo after configuration changes

**"Tool names not recognized"**
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

### Platform-Specific Debugging

#### macOS
```bash
# Install Node.js via Homebrew
brew install node

# Check configuration file location
ls -la ~/Library/Application\ Support/Claude/

# View logs
tail -f ~/Library/Logs/Claude/claude_desktop.log
```

#### Windows
```bash
# Check configuration file location
dir %APPDATA%\Claude\

# Set environment variable permanently
setx OPENAI_API_KEY "your-key-here"
```

#### Linux
```bash
# Install Node.js (Ubuntu/Debian)
sudo apt update && sudo apt install nodejs npm

# Check configuration file location
ls -la ~/.config/Claude/

# View system logs
journalctl -f
```

### Debug Mode

#### NPM Package Debug
```bash
DEBUG=* OPENAI_API_KEY="your-key" npx openai-vector-store-mcp
```

#### Cloudflare Workers Debug
```bash
# Test with verbose curl output
curl -v -X POST "https://vectorstore.jezweb.com/mcp/YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

#### Local Development Debug
```bash
# Start with debug logging
DEBUG=* npm run dev

# Check server logs
tail -f logs/server.log
```

### Getting Help

1. **Check Documentation**: Review the [Universal MCP Server Guide](UNIVERSAL-MCP-SERVER-GUIDE.md)
2. **Test Isolation**: Test each component separately (API key, server, client)
3. **Configuration Validation**: Use JSON validators for configuration files
4. **Community Support**: Check the [main repository](https://github.com/jezweb/openai-vector-assistant-mcp) for issues and discussions
5. **Performance Comparison**: Try different deployment options to identify the best fit

### Migration Between Options

#### From Cloudflare Workers to NPM Package
1. Remove `mcp-proxy` from configuration
2. Update configuration to use direct stdio transport
3. Add environment variable for API key
4. Test the new configuration

#### From NPM Package to Cloudflare Workers
1. Install `mcp-proxy`: `npm install -g mcp-proxy`
2. Update configuration to use proxy with Cloudflare Workers URL
3. Embed API key in the URL
4. Test the new configuration

#### From Local Development to Production
1. Choose between NPM package or Cloudflare Workers
2. Update configuration accordingly
3. Test thoroughly before switching permanently

---

This completes the Universal MCP Client Setup Guide. Choose the deployment option that best fits your needs and follow the corresponding setup instructions for your MCP client.