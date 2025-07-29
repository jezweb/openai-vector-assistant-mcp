# System Architecture

## Overview

This MCP server follows a clean, single-responsibility architecture optimized for Cloudflare Workers. It eliminates the complexity of the previous implementation while maintaining full MCP protocol compliance.

## Architecture Principles

### 1. Single Worker Pattern
- **One Entry Point**: All requests handled by single `worker.ts` file
- **No Proxy Layer**: Direct MCP protocol implementation
- **Minimal Routing**: Simple URL pattern matching
- **Stateless Design**: No session management or persistent connections

### 2. Clean Separation of Concerns
```
┌─────────────────────────────────────────┐
│ HTTP Request Handler                    │
│ - CORS headers                          │
│ - Authentication                        │
│ - Routing                               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ MCP Protocol Handler                    │
│ - Initialize                            │
│ - Tools/List                            │
│ - Tools/Call                            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ OpenAI Service Layer                    │
│ - API client wrapper                    │
│ - Error handling                        │
│ - Response formatting                   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ OpenAI Vector Store API                 │
│ - Create/List/Get/Delete                │
│ - File operations                       │
└─────────────────────────────────────────┘
```

## File Structure

```
src/
├── worker.ts              # Main Cloudflare Worker entry point
├── types.ts               # TypeScript interfaces and types
├── mcp-handler.ts         # MCP protocol handling logic
└── services/
    └── openai-service.ts  # OpenAI API client wrapper
```

## Component Details

### worker.ts (Main Entry Point)
**Responsibilities:**
- HTTP request handling and routing
- CORS header management
- URL-based authentication
- Error boundary for all operations

**Key Functions:**
```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response>
}

function handleMCPRequest(request: Request, env: Env): Promise<Response>
function validateAuthentication(request: Request, env: Env): boolean
function createCORSHeaders(): Record<string, string>
```

### mcp-handler.ts (Protocol Logic)
**Responsibilities:**
- MCP JSON-RPC 2.0 protocol implementation
- Request/response validation
- Tool definition and routing

**Key Functions:**
```typescript
function handleInitialize(request: MCPRequest): MCPResponse
function handleToolsList(): MCPResponse
function handleToolsCall(request: MCPRequest, openaiService: OpenAIService): Promise<MCPResponse>
function createErrorResponse(code: number, message: string, id?: any): MCPResponse
```

### openai-service.ts (API Client)
**Responsibilities:**
- OpenAI API communication
- Request/response transformation
- Error handling and retry logic

**Key Functions:**
```typescript
class OpenAIService {
  async createVectorStore(params: CreateVectorStoreParams): Promise<VectorStore>
  async listVectorStores(params?: ListVectorStoresParams): Promise<VectorStore[]>
  async getVectorStore(id: string): Promise<VectorStore>
  async deleteVectorStore(id: string): Promise<DeleteResult>
}
```

### types.ts (Type Definitions)
**Responsibilities:**
- MCP protocol types
- OpenAI API types
- Environment variable types

## Authentication Flow

```
1. Client Request → https://worker.workers.dev/mcp/{api-key}
2. Extract API key from URL path
3. Compare with MCP_API_KEY environment variable
4. Return 401 if invalid, continue if valid
5. Process MCP request
```

**Benefits:**
- No header management required
- Simple for clients to implement
- Secure (HTTPS required)
- No session state needed

## Request Flow

### 1. HTTP Request Processing
```
Request → CORS Check → Auth Check → Route to MCP Handler
```

### 2. MCP Protocol Processing
```
Parse JSON-RPC → Validate Method → Route to Tool Handler → Format Response
```

### 3. OpenAI API Integration
```
Tool Call → Validate Params → Call OpenAI API → Transform Response → Return to Client
```

## Error Handling Strategy

### 1. Authentication Errors
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32600,
    "message": "Unauthorized: Invalid API key"
  },
  "id": null
}
```

### 2. Validation Errors
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32602,
    "message": "Invalid params: 'name' is required"
  },
  "id": 1
}
```

### 3. OpenAI API Errors
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32603,
    "message": "OpenAI API error: Rate limit exceeded"
  },
  "id": 1
}
```

## Performance Optimizations

### 1. Minimal Dependencies
- Zero runtime dependencies
- Only TypeScript types for development
- Reduces bundle size and cold start time

### 2. Efficient Request Handling
- Single-pass JSON parsing
- Direct API calls without middleware
- Minimal memory allocation

### 3. Cloudflare Workers Optimizations
- Edge deployment for low latency
- Automatic scaling
- Built-in DDoS protection

## Security Considerations

### 1. API Key Protection
- Never log API keys
- Validate on every request
- Use environment variables only

### 2. Input Validation
- Sanitize all user inputs
- Validate against OpenAI API schemas
- Prevent injection attacks

### 3. CORS Configuration
- Allow necessary origins only
- Proper preflight handling
- Secure headers

## Scalability Design

### 1. Stateless Architecture
- No server-side sessions
- Each request independent
- Horizontal scaling ready

### 2. Resource Efficiency
- Minimal memory usage
- Fast execution time
- Efficient garbage collection

### 3. Error Isolation
- Request-level error boundaries
- No cascading failures
- Graceful degradation

## Monitoring and Observability

### 1. Built-in Cloudflare Analytics
- Request volume and latency
- Error rates and status codes
- Geographic distribution

### 2. Custom Logging
- Error details (without sensitive data)
- Performance metrics
- Usage patterns

### 3. Health Checks
- Root endpoint for status
- OpenAI API connectivity
- Environment validation

## Extension Points

### 1. Additional APIs
- Same pattern for other REST APIs
- Modular service layer
- Consistent error handling

### 2. Additional Tools
- Easy to add new vector store operations
- File upload/download tools
- Batch operations

### 3. Enhanced Features
- Caching layer
- Rate limiting
- Request queuing