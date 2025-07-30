# MCP Client Integration Files

This directory contains ready-to-use configuration files and documentation for integrating the OpenAI Vector Store MCP server with popular MCP clients.

## Files Overview

### Configuration Files

- **[`claude-desktop-config.json`](claude-desktop-config.json)** - Ready-to-use configuration for Claude Desktop
- **[`roo-config.json`](roo-config.json)** - Ready-to-use configuration for Roo with `alwaysAllow` permissions

### Documentation

- **[`CLIENT-SETUP-GUIDE.md`](CLIENT-SETUP-GUIDE.md)** - Comprehensive setup and testing guide

## Quick Start

1. **Get your OpenAI API Key** - Ensure you have a valid OpenAI API key with Assistants API access

2. **Choose your MCP client** and copy the appropriate configuration file:
   - For Claude Desktop: Use [`claude-desktop-config.json`](claude-desktop-config.json)
   - For Roo: Use [`roo-config.json`](roo-config.json)

3. **Update the API key** - Replace `YOUR_OPENAI_API_KEY_HERE` with your actual OpenAI API key

4. **Follow the setup guide** - See [`CLIENT-SETUP-GUIDE.md`](CLIENT-SETUP-GUIDE.md) for detailed instructions

## Server Details

- **Production URL**: `https://vectorstore.jezweb.com`
- **Authentication**: `/mcp/{openai-api-key}`
- **Protocol**: MCP 2024-11-05
- **Transport**: HTTP via `@modelcontextprotocol/server-fetch`

## Available Tools

The server provides 4 vector store management tools:

1. `vector-store-create` - Create a new vector store
2. `vector-store-list` - List all vector stores  
3. `vector-store-get` - Get details of a specific vector store
4. `vector-store-delete` - Delete a vector store

## Testing

After configuration, test the integration by:

1. Asking your MCP client to list available tools
2. Creating a test vector store
3. Listing your vector stores
4. Getting details of the created store
5. Deleting the test store

See the [setup guide](CLIENT-SETUP-GUIDE.md) for detailed testing instructions and troubleshooting.

## Security Note

⚠️ **Important**: Never commit your OpenAI API key to version control. The configurations use placeholder text that must be replaced with your actual API key.