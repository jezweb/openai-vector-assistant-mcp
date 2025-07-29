# MCP Client Setup Guide

This guide provides step-by-step instructions for configuring and testing the OpenAI Vector Store MCP server with different MCP clients.

## Server Information

- **Production URL**: `https://mcp-server-cloudflare.webfonts.workers.dev`
- **Authentication Pattern**: `/mcp/{openai-api-key}`
- **Protocol Version**: MCP 2024-11-05
- **Transport**: HTTP via `mcp-proxy`

## Available Tools

The server provides 4 vector store management tools:

1. **vector-store-create** - Create a new vector store
2. **vector-store-list** - List all vector stores
3. **vector-store-get** - Get details of a specific vector store
4. **vector-store-delete** - Delete a vector store

## Prerequisites

1. **OpenAI API Key**: You need a valid OpenAI API key with access to the Assistants API
2. **Node.js**: Required for the `mcp-proxy` package
3. **MCP Client**: Either Claude Desktop or Roo

## Claude Desktop Setup

### 1. Install Dependencies

First, ensure you have the MCP proxy package installed globally:

```bash
npm install -g mcp-proxy
```

### 2. Locate Configuration File

Find your Claude Desktop configuration file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### 3. Configure Claude Desktop

Copy the contents of [`claude-desktop-config.json`](claude-desktop-config.json) to your Claude Desktop configuration file, or merge it with your existing configuration:

```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": [
        "mcp-proxy",
        "https://mcp-server-cloudflare.webfonts.workers.dev/mcp/YOUR_OPENAI_API_KEY_HERE"
      ],
      "env": {}
    }
  }
}
```

### 4. Update API Key

Replace `YOUR_OPENAI_API_KEY_HERE` with your actual OpenAI API key.

### 5. Restart Claude Desktop

Close and restart Claude Desktop for the configuration to take effect.

## Roo Setup

### 1. Install Dependencies

Ensure you have the MCP proxy package installed:

```bash
npm install -g mcp-proxy
```

### 2. Locate Configuration File

Find your Roo configuration file (typically `~/.config/roo/config.json` or as specified in your Roo installation).

### 3. Configure Roo

Copy the contents of [`roo-config.json`](roo-config.json) to your Roo configuration file:

```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": [
        "mcp-proxy",
        "https://mcp-server-cloudflare.webfonts.workers.dev/mcp/YOUR_OPENAI_API_KEY_HERE"
      ],
      "env": {},
      "alwaysAllow": [
        "vector-store-create",
        "vector-store-list", 
        "vector-store-get",
        "vector-store-delete"
      ]
    }
  }
}
```

### 4. Update API Key

Replace `YOUR_OPENAI_API_KEY_HERE` with your actual OpenAI API key.

### 5. Restart Roo

Restart Roo for the configuration to take effect.

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
- Ensure the URL in your configuration is exactly: `https://mcp-server-cloudflare.webfonts.workers.dev/mcp/YOUR_API_KEY`

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
curl -X POST "https://mcp-server-cloudflare.webfonts.workers.dev/mcp/YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

Expected response should include the 4 vector store tools.

#### 3. Check Network Connectivity

Ensure you can reach the server:

```bash
curl -I https://mcp-server-cloudflare.webfonts.workers.dev
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