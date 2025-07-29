# MCP Client Setup Guide

## Overview

This guide covers configuring various MCP clients to connect to your OpenAI Vector Store MCP server. It includes setup instructions for Claude Desktop, Roo, and other MCP-compatible clients.

## General Configuration Principles

### 1. Connection Methods
MCP clients can connect to your server using:
- **HTTP Transport**: Direct HTTP requests to your Cloudflare Worker
- **Fetch Transport**: Using `@modelcontextprotocol/server-fetch` wrapper
- **Custom Transport**: Client-specific implementations

### 2. Authentication
Your server uses URL-based authentication:
```
https://your-worker.workers.dev/mcp/{your-api-key}
```

### 3. Configuration Format
Most clients use JSON configuration files with this general structure:
```json
{
  "mcpServers": {
    "server-name": {
      "command": "connection-method",
      "args": ["connection-parameters"],
      "env": {"environment-variables": "values"}
    }
  }
}
```

## Claude Desktop Setup

### 1. Locate Configuration File

#### macOS
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

#### Windows
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

#### Linux
```bash
~/.config/Claude/claude_desktop_config.json
```

### 2. Configuration Options

#### Option A: Using server-fetch (Recommended)
```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-fetch",
        "https://your-worker.workers.dev/mcp/your-api-key"
      ]
    }
  }
}
```

#### Option B: Using curl (Alternative)
```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "curl",
      "args": [
        "-X", "POST",
        "-H", "Content-Type: application/json",
        "-d", "@-",
        "https://your-worker.workers.dev/mcp/your-api-key"
      ]
    }
  }
}
```

#### Option C: Custom Domain
```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-fetch",
        "https://api.yourdomain.com/mcp/your-api-key"
      ]
    }
  }
}
```

### 3. Advanced Configuration
```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-fetch",
        "https://your-worker.workers.dev/mcp/your-api-key"
      ],
      "env": {
        "NODE_TLS_REJECT_UNAUTHORIZED": "1",
        "HTTP_TIMEOUT": "30000"
      }
    }
  }
}
```

### 4. Restart Claude Desktop
After updating the configuration:
1. Completely quit Claude Desktop
2. Restart the application
3. Check that tools appear in the interface

## Roo Setup

### 1. Locate Configuration File
Roo uses a similar configuration format. The file location depends on your installation:

#### Default Location
```bash
~/.config/roo/mcp_settings.json
```

#### Alternative Location
Check Roo's settings or documentation for the exact path.

### 2. Configuration Format
```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-fetch",
        "https://your-worker.workers.dev/mcp/your-api-key"
      ],
      "alwaysAllow": [
        "vector-store-list",
        "vector-store-create",
        "vector-store-get",
        "vector-store-delete"
      ]
    }
  }
}
```

### 3. Roo-Specific Options
```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-fetch",
        "https://your-worker.workers.dev/mcp/your-api-key"
      ],
      "env": {
        "DEBUG": "false",
        "TIMEOUT": "30000"
      },
      "alwaysAllow": [
        "vector-store-list",
        "vector-store-create",
        "vector-store-get",
        "vector-store-delete",
        "vector-store-file-add",
        "vector-store-file-list",
        "vector-store-file-delete"
      ],
      "description": "OpenAI Vector Store operations"
    }
  }
}
```

## Generic MCP Client Setup

### 1. HTTP Transport Configuration
For clients that support direct HTTP transport:
```json
{
  "mcpServers": {
    "openai-vector-store": {
      "transport": "http",
      "uri": "https://your-worker.workers.dev/mcp/your-api-key",
      "headers": {
        "Content-Type": "application/json",
        "User-Agent": "MCP-Client/1.0.0"
      }
    }
  }
}
```

### 2. WebSocket Transport (Not Supported)
Note: This server only supports HTTP POST requests, not WebSocket connections.

### 3. Custom Client Implementation
For custom clients, use this connection pattern:
```javascript
// Example JavaScript client
const mcpClient = {
  endpoint: 'https://your-worker.workers.dev/mcp/your-api-key',
  
  async call(method, params = {}, id = 1) {
    const request = {
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: id
    };
    
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });
    
    return response.json();
  }
};

// Usage
const tools = await mcpClient.call('tools/list');
const result = await mcpClient.call('tools/call', {
  name: 'vector-store-list',
  arguments: { limit: 10 }
});
```

## Development and Testing Setup

### 1. Local Development Configuration
For testing with local development server:
```json
{
  "mcpServers": {
    "openai-vector-store-dev": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-fetch",
        "http://localhost:8787/mcp/your-test-api-key"
      ]
    }
  }
}
```

### 2. Multiple Environment Setup
Configure different environments:
```json
{
  "mcpServers": {
    "openai-vector-store-dev": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-fetch",
        "http://localhost:8787/mcp/dev-api-key"
      ]
    },
    "openai-vector-store-staging": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-fetch",
        "https://staging-worker.workers.dev/mcp/staging-api-key"
      ]
    },
    "openai-vector-store-prod": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-fetch",
        "https://your-worker.workers.dev/mcp/prod-api-key"
      ]
    }
  }
}
```

## Security Considerations

### 1. API Key Management
- **Never commit API keys** to version control
- **Use different keys** for different environments
- **Rotate keys regularly** (quarterly recommended)
- **Use strong, unique keys** (minimum 32 characters)

### 2. Network Security
- **Always use HTTPS** in production
- **Validate SSL certificates** (don't disable TLS verification)
- **Monitor for unauthorized access** in Cloudflare logs

### 3. Client-Side Security
```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-fetch",
        "https://your-worker.workers.dev/mcp/your-api-key"
      ],
      "env": {
        "NODE_TLS_REJECT_UNAUTHORIZED": "1",
        "HTTPS_PROXY": "",
        "HTTP_PROXY": ""
      }
    }
  }
}
```

## Troubleshooting

### 1. Connection Issues

#### Check Server Status
```bash
# Test server health
curl https://your-worker.workers.dev/

# Test MCP endpoint
curl -X POST https://your-worker.workers.dev/mcp/your-api-key \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}'
```

#### Common Problems
- **Invalid API key**: Check key matches server configuration
- **Network issues**: Test with curl first
- **Client configuration**: Verify JSON syntax
- **Server deployment**: Check Cloudflare Workers status

### 2. Authentication Errors

#### Verify API Key
```bash
# Test with correct API key
curl -X POST https://your-worker.workers.dev/mcp/correct-key \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# Test with incorrect API key (should return 401)
curl -X POST https://your-worker.workers.dev/mcp/wrong-key \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

#### Check Server Logs
```bash
# View Cloudflare Workers logs
wrangler tail --env production
```

### 3. Tool Execution Issues

#### Test Individual Tools
```bash
# Test vector store list
curl -X POST https://your-worker.workers.dev/mcp/your-api-key \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "vector-store-list",
      "arguments": {"limit": 5}
    },
    "id": 1
  }'
```

#### Check OpenAI API Access
- Verify OpenAI API key is valid
- Check API key permissions
- Monitor rate limits

### 4. Client-Specific Issues

#### Claude Desktop
- Check application logs
- Verify configuration file syntax
- Restart application completely
- Check for conflicting server names

#### Roo
- Check Roo-specific logs
- Verify `alwaysAllow` permissions
- Test with minimal configuration first

## Performance Optimization

### 1. Connection Pooling
Some clients support connection pooling:
```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-fetch",
        "https://your-worker.workers.dev/mcp/your-api-key"
      ],
      "env": {
        "HTTP_KEEP_ALIVE": "true",
        "HTTP_MAX_SOCKETS": "10"
      }
    }
  }
}
```

### 2. Timeout Configuration
```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-fetch",
        "https://your-worker.workers.dev/mcp/your-api-key"
      ],
      "env": {
        "HTTP_TIMEOUT": "30000",
        "CONNECT_TIMEOUT": "5000"
      }
    }
  }
}
```

## Monitoring and Logging

### 1. Client-Side Logging
Enable debug logging in clients:
```json
{
  "mcpServers": {
    "openai-vector-store": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-fetch",
        "https://your-worker.workers.dev/mcp/your-api-key"
      ],
      "env": {
        "DEBUG": "mcp:*",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

### 2. Server-Side Monitoring
Monitor server metrics in Cloudflare Dashboard:
- Request volume and patterns
- Response times
- Error rates
- Geographic distribution

This client setup guide ensures reliable connections between MCP clients and your OpenAI Vector Store server across different environments and use cases.