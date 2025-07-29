# Testing Guide

## Overview

This guide provides comprehensive testing strategies for the MCP server, from local development to production validation.

## Testing Strategy

### 1. Unit Testing (Manual)
Test individual components in isolation

### 2. Integration Testing
Test MCP protocol compliance and OpenAI API integration

### 3. End-to-End Testing
Test with real MCP clients (Claude Desktop, Roo)

### 4. Performance Testing
Validate response times and resource usage

## Local Development Testing

### 1. Start Development Server
```bash
# Start Wrangler dev server
npm run dev

# Server should start on http://localhost:8787
```

### 2. Health Check Test
```bash
# Test basic connectivity
curl http://localhost:8787/

# Expected response:
{
  "status": "OpenAI Vector Store MCP Server Running",
  "version": "2.0.0",
  "endpoint": "/mcp/{api-key}"
}
```

### 3. Authentication Tests

#### Valid API Key Test
```bash
curl -X POST http://localhost:8787/mcp/your-test-api-key \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {}
    },
    "id": 1
  }'

# Expected: 200 OK with initialize response
```

#### Invalid API Key Test
```bash
curl -X POST http://localhost:8787/mcp/invalid-key \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {},
    "id": 1
  }'

# Expected: 401 Unauthorized
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32600,
    "message": "Unauthorized: Invalid API key"
  },
  "id": null
}
```

## MCP Protocol Testing

### 1. Initialize Method Test
```bash
curl -X POST http://localhost:8787/mcp/your-api-key \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {
        "roots": {"listChanged": true},
        "sampling": {}
      }
    },
    "id": 1
  }'

# Expected response:
{
  "jsonrpc": "2.0",
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {},
      "logging": {}
    },
    "serverInfo": {
      "name": "openai-vector-store-mcp",
      "version": "2.0.0"
    }
  },
  "id": 1
}
```

### 2. Tools List Test
```bash
curl -X POST http://localhost:8787/mcp/your-api-key \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 2
  }'

# Expected: List of 4 vector store tools
```

### 3. Tools Call Tests

#### Vector Store List Test
```bash
curl -X POST http://localhost:8787/mcp/your-api-key \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "vector-store-list",
      "arguments": {
        "limit": 5,
        "order": "desc"
      }
    },
    "id": 3
  }'

# Expected: JSON array of vector stores
```

#### Vector Store Create Test
```bash
curl -X POST http://localhost:8787/mcp/your-api-key \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "vector-store-create",
      "arguments": {
        "name": "Test Vector Store",
        "expires_after_days": 7,
        "metadata": {
          "purpose": "testing",
          "created_by": "mcp_test"
        }
      }
    },
    "id": 4
  }'

# Expected: New vector store object with ID
```

#### Vector Store Get Test
```bash
# Use ID from create test above
curl -X POST http://localhost:8787/mcp/your-api-key \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "vector-store-get",
      "arguments": {
        "vector_store_id": "vs_abc123"
      }
    },
    "id": 5
  }'

# Expected: Vector store details
```

#### Vector Store Delete Test
```bash
curl -X POST http://localhost:8787/mcp/your-api-key \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "vector-store-delete",
      "arguments": {
        "vector_store_id": "vs_abc123"
      }
    },
    "id": 6
  }'

# Expected: Deletion confirmation
```

## Error Handling Tests

### 1. Invalid Method Test
```bash
curl -X POST http://localhost:8787/mcp/your-api-key \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "invalid/method",
    "id": 7
  }'

# Expected: Method not found error (-32601)
```

### 2. Invalid Tool Test
```bash
curl -X POST http://localhost:8787/mcp/your-api-key \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "invalid-tool",
      "arguments": {}
    },
    "id": 8
  }'

# Expected: Tool not found error
```

### 3. Missing Parameters Test
```bash
curl -X POST http://localhost:8787/mcp/your-api-key \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "vector-store-create",
      "arguments": {}
    },
    "id": 9
  }'

# Expected: OpenAI validation error
```

### 4. Invalid JSON Test
```bash
curl -X POST http://localhost:8787/mcp/your-api-key \
  -H "Content-Type: application/json" \
  -d '{"invalid": json}'

# Expected: JSON parse error
```

## CORS Testing

### 1. Preflight Request Test
```bash
curl -X OPTIONS http://localhost:8787/mcp/your-api-key \
  -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"

# Expected: 204 No Content with CORS headers
```

### 2. Cross-Origin Request Test
```bash
curl -X POST http://localhost:8787/mcp/your-api-key \
  -H "Content-Type: application/json" \
  -H "Origin: https://example.com" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {},
    "id": 1
  }'

# Expected: Response with Access-Control-Allow-Origin: *
```

## Performance Testing

### 1. Response Time Test
```bash
# Test multiple requests and measure time
for i in {1..10}; do
  time curl -s -X POST http://localhost:8787/mcp/your-api-key \
    -H "Content-Type: application/json" \
    -d '{
      "jsonrpc": "2.0",
      "method": "tools/list",
      "id": '$i'
    }' > /dev/null
done

# Expected: < 100ms per request (excluding OpenAI API time)
```

### 2. Concurrent Request Test
```bash
# Test 10 concurrent requests
for i in {1..10}; do
  curl -s -X POST http://localhost:8787/mcp/your-api-key \
    -H "Content-Type: application/json" \
    -d '{
      "jsonrpc": "2.0",
      "method": "tools/list",
      "id": '$i'
    }' &
done
wait

# Expected: All requests succeed
```

## MCP Client Testing

### 1. Create Test Configuration

#### For Claude Desktop
Create `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "openai-vector-store-test": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-fetch",
        "http://localhost:8787/mcp/your-api-key"
      ]
    }
  }
}
```

#### For Roo
Create MCP settings:
```json
{
  "mcpServers": {
    "openai-vector-store-test": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-fetch",
        "http://localhost:8787/mcp/your-api-key"
      ]
    }
  }
}
```

### 2. Test MCP Client Integration

1. **Start your MCP server** (local or deployed)
2. **Configure MCP client** with test configuration
3. **Restart MCP client** to load new configuration
4. **Test tool availability** - tools should appear in client
5. **Test tool execution** - try creating/listing vector stores

### 3. Validate Tool Responses

Test each tool through the MCP client:
- `vector-store-list` - Should return formatted list
- `vector-store-create` - Should create and return new store
- `vector-store-get` - Should return store details
- `vector-store-delete` - Should confirm deletion

## Production Testing

### 1. Deploy to Cloudflare
```bash
# Deploy to production
npm run deploy

# Set production secrets
echo "your-openai-api-key" | wrangler secret put OPENAI_API_KEY
echo "your-mcp-api-key" | wrangler secret put MCP_API_KEY
```

### 2. Test Production Endpoint
```bash
# Replace with your actual worker URL
curl https://your-worker.workers.dev/

# Test MCP endpoint
curl -X POST https://your-worker.workers.dev/mcp/your-api-key \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {},
    "id": 1
  }'
```

### 3. Update MCP Client Configuration
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

## Automated Testing Script

Create `test-script.sh`:
```bash
#!/bin/bash

# Configuration
BASE_URL="http://localhost:8787"
API_KEY="your-test-api-key"
MCP_ENDPOINT="$BASE_URL/mcp/$API_KEY"

echo "Testing MCP Server..."

# Test 1: Health check
echo "1. Testing health endpoint..."
curl -s "$BASE_URL/" | jq .

# Test 2: Initialize
echo "2. Testing initialize..."
curl -s -X POST "$MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {"protocolVersion": "2024-11-05"},
    "id": 1
  }' | jq .

# Test 3: Tools list
echo "3. Testing tools/list..."
curl -s -X POST "$MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 2
  }' | jq .

# Test 4: Vector store list
echo "4. Testing vector-store-list..."
curl -s -X POST "$MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "vector-store-list",
      "arguments": {"limit": 5}
    },
    "id": 3
  }' | jq .

echo "Testing complete!"
```

Make it executable and run:
```bash
chmod +x test-script.sh
./test-script.sh
```

## Troubleshooting Common Issues

### 1. Connection Refused
- Check if Wrangler dev server is running
- Verify port 8787 is not blocked
- Try `wrangler dev --port 8788` for different port

### 2. Authentication Errors
- Verify API key in URL matches MCP_API_KEY secret
- Check OpenAI API key is valid and has vector store permissions
- Ensure secrets are set correctly: `wrangler secret list`

### 3. CORS Errors
- Check browser developer tools for specific CORS issues
- Verify CORS headers are included in all responses
- Test with curl first to isolate CORS from other issues

### 4. OpenAI API Errors
- Test OpenAI API key directly with curl
- Check rate limits and quotas
- Verify API key has vector store permissions

### 5. MCP Client Issues
- Check MCP client logs for connection errors
- Verify client configuration syntax
- Test with simple HTTP client first
- Restart MCP client after configuration changes

This comprehensive testing approach ensures your MCP server works correctly across all scenarios and integrates properly with MCP clients.