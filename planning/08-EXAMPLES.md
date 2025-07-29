# Code Examples and Templates

## Overview

This document contains all the code examples and templates needed to implement the clean MCP server. Copy these code blocks into the appropriate files as outlined in the Implementation Guide.

## Project Files

### 1. package.json
```json
{
  "name": "openai-vector-store-mcp",
  "version": "2.0.0",
  "description": "Clean MCP server for OpenAI Vector Store API on Cloudflare Workers",
  "main": "src/worker.ts",
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "build": "tsc",
    "deploy": "wrangler deploy",
    "deploy:dev": "wrangler deploy --env development",
    "deploy:prod": "wrangler deploy --env production",
    "test": "wrangler dev --local",
    "tail": "wrangler tail",
    "tail:prod": "wrangler tail --env production"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20241127.0",
    "typescript": "^5.8.3",
    "wrangler": "^4.26.1"
  },
  "keywords": ["mcp", "openai", "vector-store", "cloudflare-workers"],
  "author": "Your Name",
  "license": "MIT"
}
```

### 2. tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["@cloudflare/workers-types"],
    "lib": ["ES2022", "WebWorker"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "*.config.js"]
}
```

### 3. wrangler.toml
```toml
name = "openai-vector-store-mcp"
main = "src/worker.ts"
compatibility_date = "2024-12-06"
compatibility_flags = ["nodejs_compat"]

[vars]
MCP_SERVER_NAME = "openai-vector-store-mcp"
MCP_SERVER_VERSION = "2.0.0"

# Development environment
[env.development]
name = "openai-vector-store-mcp-dev"
vars = { ENVIRONMENT = "development" }

# Production environment
[env.production]
name = "openai-vector-store-mcp"
vars = { ENVIRONMENT = "production" }

# Secrets to be set via: wrangler secret put SECRET_NAME
# OPENAI_API_KEY - Your OpenAI API key
# MCP_API_KEY - Your MCP authentication key
```

### 4. src/types.ts
```typescript
// Environment interface for Cloudflare Workers
export interface Env {
  OPENAI_API_KEY: string;
  MCP_API_KEY: string;
  MCP_SERVER_NAME?: string;
  MCP_SERVER_VERSION?: string;
  ENVIRONMENT?: string;
}

// MCP Protocol Types
export interface MCPRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id?: string | number | null;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: MCPError;
  id?: string | number | null;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

// Tool-specific types
export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

// OpenAI Vector Store Types
export interface VectorStore {
  id: string;
  object: 'vector_store';
  created_at: number;
  name: string;
  description: string | null;
  usage_bytes: number;
  file_counts: {
    in_progress: number;
    completed: number;
    failed: number;
    cancelled: number;
    total: number;
  };
  status: 'expired' | 'in_progress' | 'completed';
  expires_after?: {
    anchor: 'last_active_at';
    days: number;
  };
  expires_at?: number;
  last_active_at: number;
  metadata: Record<string, any>;
}

export interface CreateVectorStoreParams {
  name: string;
  expires_after_days?: number;
  metadata?: Record<string, any>;
}

export interface ListVectorStoresParams {
  limit?: number;
  order?: 'asc' | 'desc';
}

export interface OpenAIError {
  error: {
    message: string;
    type: string;
    param: string | null;
    code: string;
  };
}
```

### 5. src/services/openai-service.ts
```typescript
import { VectorStore, CreateVectorStoreParams, ListVectorStoresParams, OpenAIError } from '../types.js';

export class OpenAIService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'MCP-Server/2.0.0',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: OpenAIError = await response.json();
      throw new Error(`OpenAI API error: ${error.error.message}`);
    }

    return response.json();
  }

  async createVectorStore(params: CreateVectorStoreParams): Promise<VectorStore> {
    const body: any = {
      name: params.name,
      metadata: params.metadata || {},
    };

    if (params.expires_after_days) {
      body.expires_after = {
        anchor: 'last_active_at',
        days: params.expires_after_days,
      };
    }

    return this.makeRequest('/vector_stores', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async listVectorStores(params: ListVectorStoresParams = {}): Promise<VectorStore[]> {
    const searchParams = new URLSearchParams();
    
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.order) searchParams.set('order', params.order);

    const query = searchParams.toString();
    const endpoint = `/vector_stores${query ? `?${query}` : ''}`;
    
    const response = await this.makeRequest(endpoint);
    return response.data;
  }

  async getVectorStore(id: string): Promise<VectorStore> {
    return this.makeRequest(`/vector_stores/${id}`);
  }

  async deleteVectorStore(id: string): Promise<{ id: string; deleted: boolean }> {
    return this.makeRequest(`/vector_stores/${id}`, {
      method: 'DELETE',
    });
  }

  // File operations (implement later if needed)
  async addFileToVectorStore(vectorStoreId: string, fileId: string): Promise<any> {
    return this.makeRequest(`/vector_stores/${vectorStoreId}/files`, {
      method: 'POST',
      body: JSON.stringify({ file_id: fileId }),
    });
  }

  async listVectorStoreFiles(vectorStoreId: string, params: any = {}): Promise<any[]> {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.filter) searchParams.set('filter', params.filter);

    const query = searchParams.toString();
    const endpoint = `/vector_stores/${vectorStoreId}/files${query ? `?${query}` : ''}`;
    
    const response = await this.makeRequest(endpoint);
    return response.data;
  }

  async deleteVectorStoreFile(vectorStoreId: string, fileId: string): Promise<any> {
    return this.makeRequest(`/vector_stores/${vectorStoreId}/files/${fileId}`, {
      method: 'DELETE',
    });
  }
}
```

### 6. src/mcp-handler.ts
```typescript
import { MCPRequest, MCPResponse, MCPError, ToolCall } from './types.js';
import { OpenAIService } from './services/openai-service.js';

export class MCPHandler {
  private openaiService: OpenAIService;

  constructor(openaiService: OpenAIService) {
    this.openaiService = openaiService;
  }

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      switch (request.method) {
        case 'initialize':
          return this.handleInitialize(request);
        case 'tools/list':
          return this.handleToolsList(request);
        case 'tools/call':
          return await this.handleToolsCall(request);
        default:
          return this.createErrorResponse(-32601, `Method not found: ${request.method}`, request.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal error';
      return this.createErrorResponse(-32603, message, request.id);
    }
  }

  private handleInitialize(request: MCPRequest): MCPResponse {
    return {
      jsonrpc: '2.0',
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          logging: {},
        },
        serverInfo: {
          name: 'openai-vector-store-mcp',
          version: '2.0.0',
        },
      },
      id: request.id,
    };
  }

  private handleToolsList(request: MCPRequest): MCPResponse {
    return {
      jsonrpc: '2.0',
      result: {
        tools: [
          {
            name: 'vector-store-create',
            description: 'Create a new vector store',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the vector store',
                },
                expires_after_days: {
                  type: 'number',
                  description: 'Number of days after which the vector store expires (optional)',
                },
                metadata: {
                  type: 'object',
                  description: 'Additional metadata for the vector store (optional)',
                },
              },
              required: ['name'],
            },
          },
          {
            name: 'vector-store-list',
            description: 'List all vector stores',
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Maximum number of vector stores to return (default: 20)',
                },
                order: {
                  type: 'string',
                  enum: ['asc', 'desc'],
                  description: 'Sort order by created_at timestamp',
                },
              },
            },
          },
          {
            name: 'vector-store-get',
            description: 'Get details of a specific vector store',
            inputSchema: {
              type: 'object',
              properties: {
                vector_store_id: {
                  type: 'string',
                  description: 'ID of the vector store to retrieve',
                },
              },
              required: ['vector_store_id'],
            },
          },
          {
            name: 'vector-store-delete',
            description: 'Delete a vector store',
            inputSchema: {
              type: 'object',
              properties: {
                vector_store_id: {
                  type: 'string',
                  description: 'ID of the vector store to delete',
                },
              },
              required: ['vector_store_id'],
            },
          },
        ],
      },
      id: request.id,
    };
  }

  private async handleToolsCall(request: MCPRequest): Promise<MCPResponse> {
    const { name, arguments: args } = request.params as ToolCall;

    try {
      let result: any;

      switch (name) {
        case 'vector-store-create':
          result = await this.openaiService.createVectorStore(args);
          break;
        case 'vector-store-list':
          result = await this.openaiService.listVectorStores(args);
          break;
        case 'vector-store-get':
          result = await this.openaiService.getVectorStore(args.vector_store_id);
          break;
        case 'vector-store-delete':
          result = await this.openaiService.deleteVectorStore(args.vector_store_id);
          break;
        default:
          return this.createErrorResponse(-32601, `Tool not found: ${name}`, request.id);
      }

      return {
        jsonrpc: '2.0',
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        },
        id: request.id,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tool execution failed';
      return this.createErrorResponse(-32603, message, request.id);
    }
  }

  private createErrorResponse(code: number, message: string, id?: string | number | null): MCPResponse {
    return {
      jsonrpc: '2.0',
      error: {
        code,
        message,
      },
      id,
    };
  }
}
```

### 7. src/worker.ts
```typescript
import { Env, MCPRequest } from './types.js';
import { MCPHandler } from './mcp-handler.js';
import { OpenAIService } from './services/openai-service.js';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      const url = new URL(request.url);

      // Health check endpoint
      if (url.pathname === '/') {
        return new Response(JSON.stringify({
          status: 'OpenAI Vector Store MCP Server Running',
          version: env.MCP_SERVER_VERSION || '2.0.0',
          endpoint: '/mcp/{api-key}',
          environment: env.ENVIRONMENT || 'production',
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // MCP endpoint with API key in path
      const mcpPattern = /^\/mcp\/(.+)$/;
      const match = url.pathname.match(mcpPattern);

      if (match && request.method === 'POST') {
        const providedApiKey = match[1];

        // Validate API key
        if (!env.MCP_API_KEY || providedApiKey !== env.MCP_API_KEY) {
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32600,
              message: 'Unauthorized: Invalid API key',
            },
            id: null,
          }), {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        // Validate OpenAI API key
        if (!env.OPENAI_API_KEY) {
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: 'Server configuration error: OpenAI API key not set',
            },
            id: null,
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        // Parse and handle MCP request
        const mcpRequest: MCPRequest = await request.json();
        
        // Initialize services
        const openaiService = new OpenAIService(env.OPENAI_API_KEY);
        const mcpHandler = new MCPHandler(openaiService);

        // Process request
        const response = await mcpHandler.handleRequest(mcpRequest);

        return new Response(JSON.stringify(response), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // 404 for unknown paths
      return new Response('Not Found', {
        status: 404,
        headers: corsHeaders,
      });

    } catch (error) {
      console.error('Worker error:', error);
      
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  },
};
```

## Client Configuration Examples

### Claude Desktop Configuration
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

### Roo Configuration
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

## Testing Scripts

### Basic Test Script (test.sh)
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

## README.md Template
```markdown
# OpenAI Vector Store MCP Server

A clean, modern Model Context Protocol (MCP) server for OpenAI Vector Store API, deployable on Cloudflare Workers.

## Features

- ✅ **Vector Store Management**: Create, list, get, and delete vector stores
- ✅ **Clean Architecture**: Single Worker file, no complex transport layers
- ✅ **Simple Authentication**: API key in URL path
- ✅ **Edge Deployment**: Cloudflare Workers for global low latency
- ✅ **Type Safety**: Full TypeScript implementation
- ✅ **Zero Dependencies**: No runtime dependencies

## Quick Start

1. **Clone and Setup**
   ```bash
   git clone <your-repo>
   cd openai-vector-store-mcp
   npm install
   ```

2. **Configure Secrets**
   ```bash
   echo "your-openai-api-key" | wrangler secret put OPENAI_API_KEY
   echo "your-mcp-api-key" | wrangler secret put MCP_API_KEY
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

4. **Configure MCP Client**
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

## Available Tools

- `vector-store-create` - Create new vector store
- `vector-store-list` - List all vector stores
- `vector-store-get` - Get vector store details
- `vector-store-delete` - Delete vector store

## Development

```bash
npm run dev     # Start local development
npm run build   # Build TypeScript
npm run test    # Test locally
```

## License

MIT
```

This examples document provides all the code templates needed to implement the clean MCP server following the architecture outlined in the previous documents.