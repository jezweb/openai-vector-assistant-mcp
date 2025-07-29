# Implementation Guide

## Step-by-Step Implementation

This guide provides detailed instructions for implementing the MCP server. Follow these steps in order to build a working implementation.

## Phase 1: Project Setup

### 1. Initialize Project
```bash
# Create project directory
mkdir openai-vector-store-mcp
cd openai-vector-store-mcp

# Initialize npm project
npm init -y

# Install development dependencies
npm install -D @cloudflare/workers-types typescript wrangler

# Create TypeScript config
npx tsc --init
```

### 2. Project Structure
Create the following directory structure:
```
openai-vector-store-mcp/
├── src/
│   ├── worker.ts
│   ├── types.ts
│   ├── mcp-handler.ts
│   └── services/
│       └── openai-service.ts
├── wrangler.toml
├── package.json
├── tsconfig.json
└── README.md
```

### 3. Configure TypeScript (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["@cloudflare/workers-types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. Configure Wrangler (wrangler.toml)
```toml
name = "openai-vector-store-mcp"
main = "src/worker.ts"
compatibility_date = "2024-12-06"
compatibility_flags = ["nodejs_compat"]

[vars]
MCP_SERVER_NAME = "openai-vector-store-mcp"
MCP_SERVER_VERSION = "2.0.0"

# Secrets to be set via: wrangler secret put SECRET_NAME
# OPENAI_API_KEY
# MCP_API_KEY
```

### 5. Update package.json Scripts
```json
{
  "scripts": {
    "dev": "wrangler dev",
    "build": "tsc",
    "deploy": "wrangler deploy",
    "test": "wrangler dev --local"
  }
}
```

## Phase 2: Type Definitions

### 1. Create types.ts
```typescript
// Environment interface for Cloudflare Workers
export interface Env {
  OPENAI_API_KEY: string;
  MCP_API_KEY: string;
  MCP_SERVER_NAME?: string;
  MCP_SERVER_VERSION?: string;
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

## Phase 3: OpenAI Service Layer

### 1. Create services/openai-service.ts
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

  // File operations (implement later)
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

## Phase 4: MCP Protocol Handler

### 1. Create mcp-handler.ts
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

## Phase 5: Main Worker Implementation

### 1. Create worker.ts
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

## Phase 6: Testing and Validation

### 1. Local Testing
```bash
# Start local development server
npm run dev

# Test health endpoint
curl http://localhost:8787/

# Test MCP endpoint (replace YOUR_API_KEY)
curl -X POST http://localhost:8787/mcp/YOUR_API_KEY \
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
```

### 2. Environment Setup
```bash
# Set secrets for local development
echo "your-openai-api-key" | wrangler secret put OPENAI_API_KEY --local
echo "your-mcp-api-key" | wrangler secret put MCP_API_KEY --local
```

### 3. Build and Deploy
```bash
# Build TypeScript
npm run build

# Deploy to Cloudflare
npm run deploy

# Set production secrets
echo "your-openai-api-key" | wrangler secret put OPENAI_API_KEY
echo "your-mcp-api-key" | wrangler secret put MCP_API_KEY
```

## Common Issues and Solutions

### 1. TypeScript Errors
- Ensure all imports use `.js` extensions for ES modules
- Check that `@cloudflare/workers-types` is installed
- Verify `tsconfig.json` module resolution settings

### 2. Runtime Errors
- Check that all environment variables are set
- Verify API key format and permissions
- Test OpenAI API connectivity separately

### 3. CORS Issues
- Ensure CORS headers are included in all responses
- Handle OPTIONS preflight requests
- Check browser developer tools for specific CORS errors

### 4. Authentication Problems
- Verify API key extraction from URL path
- Check environment variable names match exactly
- Test with curl before testing with MCP clients

This implementation provides a solid foundation that can be extended with additional tools and features as needed.