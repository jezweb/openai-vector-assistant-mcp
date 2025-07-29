// JSON-RPC 2.0 base types
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number | null;
  method: string;
  params?: any;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: any;
  error?: JsonRpcError;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: any;
}

// MCP Protocol types (legacy compatibility)
export interface MCPRequest extends JsonRpcRequest {}
export interface MCPResponse extends JsonRpcResponse {}

// MCP Initialize types
export interface MCPInitializeRequest extends JsonRpcRequest {
  method: 'initialize';
  params: {
    protocolVersion: string;
    capabilities: {
      tools?: {};
    };
    clientInfo: {
      name: string;
      version: string;
    };
  };
}

export interface MCPInitializeResponse extends JsonRpcResponse {
  result: {
    protocolVersion: string;
    capabilities: {
      tools: {
        listChanged?: boolean;
      };
    };
    serverInfo: {
      name: string;
      version: string;
    };
  };
}

// MCP Tools types
export interface MCPToolsListRequest extends JsonRpcRequest {
  method: 'tools/list';
  params?: {};
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface Tool extends MCPTool {} // Legacy compatibility

export interface MCPToolsListResponse extends JsonRpcResponse {
  result: {
    tools: MCPTool[];
  };
}

export interface MCPToolsCallRequest extends JsonRpcRequest {
  method: 'tools/call';
  params: {
    name: string;
    arguments: Record<string, any>;
  };
}

export interface MCPToolsCallResponse extends JsonRpcResponse {
  result: {
    content: Array<{
      type: 'text';
      text: string;
    }>;
    isError?: boolean;
  };
}

// MCP Resources types (legacy compatibility)
export interface Resource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

// OpenAI Vector Store API types
export interface VectorStore {
  id: string;
  object: 'vector_store';
  created_at: number;
  name: string;
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

export interface CreateVectorStoreRequest {
  name: string;
  expires_after_days?: number;
  metadata?: Record<string, any>;
}

export interface ListVectorStoresRequest {
  limit?: number;
  order?: 'asc' | 'desc';
}

export interface ListVectorStoresResponse {
  object: 'list';
  data: VectorStore[];
  first_id?: string;
  last_id?: string;
  has_more: boolean;
}

export interface VectorStoreFile {
  id: string;
  object: 'vector_store.file';
  usage_bytes: number;
  created_at: number;
  vector_store_id: string;
  status: 'in_progress' | 'completed' | 'cancelled' | 'failed';
  last_error?: {
    code: string;
    message: string;
  };
}

export interface AddFileToVectorStoreRequest {
  file_id: string;
}

export interface ListVectorStoreFilesRequest {
  limit?: number;
  filter?: 'in_progress' | 'completed' | 'failed' | 'cancelled';
}

export interface ListVectorStoreFilesResponse {
  object: 'list';
  data: VectorStoreFile[];
  first_id?: string;
  last_id?: string;
  has_more: boolean;
}

// Vector Store File Batch types
export interface VectorStoreFileBatch {
  id: string;
  object: 'vector_store.file_batch';
  created_at: number;
  vector_store_id: string;
  status: 'in_progress' | 'completed' | 'cancelled' | 'failed';
  file_counts: {
    in_progress: number;
    completed: number;
    failed: number;
    cancelled: number;
    total: number;
  };
}

// Vector Store modification types
export interface ModifyVectorStoreRequest {
  name?: string;
  expires_after_days?: number;
  metadata?: Record<string, any>;
}

// Vector Store File content types
export interface VectorStoreFileContent {
  content: string;
  metadata?: Record<string, any>;
}

// Vector Store File update types
export interface UpdateVectorStoreFileRequest {
  metadata: Record<string, any>;
}

// OpenAI Chat types (legacy compatibility)
export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletion {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Error types
export class MCPError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'MCPError';
  }
}

// Common error codes
export const ErrorCodes = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  UNAUTHORIZED: -32001,
  FORBIDDEN: -32002,
  NOT_FOUND: -32003,
  RATE_LIMITED: -32004,
} as const;

// Response interfaces for tools
export interface ToolResponse {
  success: boolean;
  data?: any;
  error?: string;
}