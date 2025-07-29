# Technical Requirements

## Functional Requirements

### Core MCP Protocol Support
- **Initialize**: Handle MCP initialization handshake
- **Tools List**: Return available vector store tools
- **Tools Call**: Execute vector store operations

### OpenAI Vector Store Tools
1. **vector-store-create**: Create new vector store with metadata and expiration
2. **vector-store-list**: List all vector stores with pagination and sorting
3. **vector-store-get**: Retrieve specific vector store details
4. **vector-store-delete**: Delete a vector store

### Authentication
- **URL-based**: API key embedded in URL path `/mcp/{api-key}`
- **Validation**: Verify API key against environment variable
- **Security**: No API key logging, secure error messages

### Error Handling
- **OpenAI API Errors**: Proper error propagation and formatting
- **Authentication Errors**: Clear unauthorized responses
- **Validation Errors**: Helpful parameter validation messages
- **Network Errors**: Graceful handling of API timeouts

## Non-Functional Requirements

### Performance
- **Response Time**: < 100ms for tool calls (excluding OpenAI API time)
- **Cold Start**: < 50ms Worker initialization
- **Memory Usage**: < 10MB per request
- **Concurrent Requests**: Support 100+ simultaneous requests

### Reliability
- **Uptime**: 99.9% availability (Cloudflare Workers SLA)
- **Error Rate**: < 0.1% for valid requests
- **Retry Logic**: Automatic retry for transient OpenAI API failures
- **Graceful Degradation**: Meaningful errors when OpenAI API is down

### Security
- **API Key Protection**: Never log or expose API keys
- **CORS**: Proper CORS headers for web clients
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Rely on Cloudflare Workers built-in limits

### Maintainability
- **Code Size**: Single Worker file < 500 lines
- **Dependencies**: Zero runtime dependencies
- **Type Safety**: Full TypeScript coverage
- **Documentation**: Inline comments for complex logic

## Technical Constraints

### Cloudflare Workers Limitations
- **Runtime**: V8 isolate, not Node.js
- **Memory**: 128MB limit
- **CPU Time**: 50ms for free tier, 30s for paid
- **Request Size**: 100MB limit
- **Response Size**: 100MB limit

### OpenAI API Constraints
- **Rate Limits**: Respect OpenAI API rate limits
- **Authentication**: Requires valid OpenAI API key
- **API Version**: Use latest stable API version
- **Error Codes**: Handle all documented error responses

### MCP Protocol Constraints
- **JSON-RPC 2.0**: Strict adherence to specification
- **Content Types**: Support text content in responses
- **Protocol Version**: Support MCP protocol version 2024-11-05
- **Transport**: HTTP POST requests only

## Environment Variables

### Required
- `OPENAI_API_KEY`: OpenAI API key for vector store access
- `MCP_API_KEY`: Authentication key for MCP server access

### Optional
- `MCP_SERVER_NAME`: Server name (default: "openai-vector-store-mcp")
- `MCP_SERVER_VERSION`: Server version (default: "2.0.0")
- `OPENAI_API_BASE_URL`: Custom OpenAI API base URL (default: https://api.openai.com/v1)

## Input/Output Specifications

### MCP Request Format
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "vector-store-create",
    "arguments": {
      "name": "My Vector Store",
      "expires_after_days": 7,
      "metadata": {"purpose": "testing"}
    }
  },
  "id": 1
}
```

### MCP Response Format
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"id\": \"vs_123\", \"name\": \"My Vector Store\", ...}"
      }
    ]
  },
  "id": 1
}
```

### Error Response Format
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32603,
    "message": "OpenAI API error: Invalid API key"
  },
  "id": 1
}
```

## Compatibility Requirements

### MCP Clients
- **Claude Desktop**: Primary target client
- **Roo**: Secondary target client
- **Generic MCP Clients**: Any client following MCP specification

### Browsers
- **CORS Support**: Enable cross-origin requests
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+

### Development Tools
- **TypeScript**: Version 5.0+
- **Wrangler**: Cloudflare Workers CLI
- **Node.js**: Version 18+ for development