/**
 * MCP Protocol Handler for stdio transport
 * 
 * This file implements the core Model Context Protocol (MCP) message handling
 * and routing logic adapted for stdio transport with vector store operations.
 */

import {
  JsonRpcRequest,
  JsonRpcResponse,
  MCPInitializeRequest,
  MCPInitializeResponse,
  MCPToolsListRequest,
  MCPToolsListResponse,
  MCPToolsCallRequest,
  MCPToolsCallResponse,
  MCPTool,
  MCPError,
  ErrorCodes
} from './types.js';
import { OpenAIService } from './openai-service.js';

export class MCPHandler {
  private openaiService: OpenAIService | null = null;
  private isProxyMode: boolean = false;
  private cloudflareWorkerUrl: string = 'https://vectorstore.jezweb.com/mcp';

  constructor(apiKey: string) {
    if (apiKey === 'CLOUDFLARE_PROXY_MODE') {
      this.isProxyMode = true;
      // This should not happen - we need a real API key for the URL
      throw new Error('API key is required for Cloudflare Worker proxy mode');
    } else {
      // Check if this looks like an OpenAI API key
      if (apiKey.startsWith('sk-')) {
        // Use Cloudflare Worker with API key in URL
        this.isProxyMode = true;
        this.cloudflareWorkerUrl = `https://vectorstore.jezweb.com/mcp/${apiKey}`;
      } else {
        // Direct OpenAI service (for local development)
        this.openaiService = new OpenAIService(apiKey);
      }
    }
  }

  /**
   * Handle incoming MCP requests
   */
  async handleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    try {
      // Validate JSON-RPC 2.0 format
      if (request.jsonrpc !== '2.0') {
        return this.createErrorResponse(request.id, ErrorCodes.INVALID_REQUEST, 'Invalid JSON-RPC version');
      }

      // If in proxy mode, forward the request to Cloudflare Worker
      if (this.isProxyMode) {
        return this.forwardToCloudflareWorker(request);
      }

      switch (request.method) {
        case 'initialize':
          return this.handleInitialize(request as MCPInitializeRequest);
        case 'tools/list':
          return this.handleToolsList(request as MCPToolsListRequest);
        case 'tools/call':
          return this.handleToolsCall(request as MCPToolsCallRequest);
        default:
          return this.createErrorResponse(request.id, ErrorCodes.METHOD_NOT_FOUND, 'Method not found');
      }
    } catch (error) {
      return this.createErrorResponse(
        request.id,
        ErrorCodes.INTERNAL_ERROR,
        'Internal error',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Forward request to Cloudflare Worker
   */
  private async forwardToCloudflareWorker(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    try {
      const response = await fetch(this.cloudflareWorkerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json() as JsonRpcResponse;
      return result;
    } catch (error) {
      return this.createErrorResponse(
        request.id,
        ErrorCodes.INTERNAL_ERROR,
        'Proxy request failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Handle initialize request
   */
  private async handleInitialize(request: MCPInitializeRequest): Promise<MCPInitializeResponse> {
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {
            listChanged: false
          }
        },
        serverInfo: {
          name: 'openai-vector-store-mcp',
          version: '1.0.1'
        }
      }
    };
  }

  /**
   * Handle tools list request
   */
  private async handleToolsList(request: MCPToolsListRequest): Promise<MCPToolsListResponse> {
    const tools: MCPTool[] = [
      {
        name: 'vector-store-create',
        description: 'Create a new vector store',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the vector store'
            },
            expires_after_days: {
              type: 'number',
              description: 'Number of days after which the vector store expires (optional)'
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata for the vector store (optional)'
            }
          },
          required: ['name']
        }
      },
      {
        name: 'vector-store-list',
        description: 'List all vector stores',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of vector stores to return (default: 20)'
            },
            order: {
              type: 'string',
              enum: ['asc', 'desc'],
              description: 'Sort order by created_at timestamp'
            }
          }
        }
      },
      {
        name: 'vector-store-get',
        description: 'Get details of a specific vector store',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: {
              type: 'string',
              description: 'ID of the vector store to retrieve'
            }
          },
          required: ['vector_store_id']
        }
      },
      {
        name: 'vector-store-delete',
        description: 'Delete a vector store',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: {
              type: 'string',
              description: 'ID of the vector store to delete'
            }
          },
          required: ['vector_store_id']
        }
      },
      {
        name: 'vector-store-modify',
        description: 'Modify a vector store',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: {
              type: 'string',
              description: 'ID of the vector store to modify'
            },
            name: {
              type: 'string',
              description: 'New name for the vector store (optional)'
            },
            expires_after_days: {
              type: 'number',
              description: 'Number of days after which the vector store expires (optional)'
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata for the vector store (optional)'
            }
          },
          required: ['vector_store_id']
        }
      },
      {
        name: 'vector-store-file-add',
        description: 'Add an existing file to a vector store',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: {
              type: 'string',
              description: 'ID of the vector store'
            },
            file_id: {
              type: 'string',
              description: 'ID of the file to add'
            }
          },
          required: ['vector_store_id', 'file_id']
        }
      },
      {
        name: 'vector-store-file-list',
        description: 'List files in a vector store',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: {
              type: 'string',
              description: 'ID of the vector store'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of files to return (default: 20)'
            },
            filter: {
              type: 'string',
              enum: ['in_progress', 'completed', 'failed', 'cancelled'],
              description: 'Filter files by status'
            }
          },
          required: ['vector_store_id']
        }
      },
      {
        name: 'vector-store-file-get',
        description: 'Get details of a specific file in a vector store',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: {
              type: 'string',
              description: 'ID of the vector store'
            },
            file_id: {
              type: 'string',
              description: 'ID of the file to retrieve'
            }
          },
          required: ['vector_store_id', 'file_id']
        }
      },
      {
        name: 'vector-store-file-content',
        description: 'Get content of a specific file in a vector store',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: {
              type: 'string',
              description: 'ID of the vector store'
            },
            file_id: {
              type: 'string',
              description: 'ID of the file to get content from'
            }
          },
          required: ['vector_store_id', 'file_id']
        }
      },
      {
        name: 'vector-store-file-update',
        description: 'Update metadata of a file in a vector store',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: {
              type: 'string',
              description: 'ID of the vector store'
            },
            file_id: {
              type: 'string',
              description: 'ID of the file to update'
            },
            metadata: {
              type: 'object',
              description: 'New metadata for the file'
            }
          },
          required: ['vector_store_id', 'file_id', 'metadata']
        }
      },
      {
        name: 'vector-store-file-delete',
        description: 'Delete a file from a vector store',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: {
              type: 'string',
              description: 'ID of the vector store'
            },
            file_id: {
              type: 'string',
              description: 'ID of the file to delete'
            }
          },
          required: ['vector_store_id', 'file_id']
        }
      },
      {
        name: 'vector-store-file-batch-create',
        description: 'Create a file batch for a vector store',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: {
              type: 'string',
              description: 'ID of the vector store'
            },
            file_ids: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of file IDs to add to the batch'
            }
          },
          required: ['vector_store_id', 'file_ids']
        }
      },
      {
        name: 'vector-store-file-batch-get',
        description: 'Get status of a file batch',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: {
              type: 'string',
              description: 'ID of the vector store'
            },
            batch_id: {
              type: 'string',
              description: 'ID of the batch to retrieve'
            }
          },
          required: ['vector_store_id', 'batch_id']
        }
      },
      {
        name: 'vector-store-file-batch-cancel',
        description: 'Cancel a file batch',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: {
              type: 'string',
              description: 'ID of the vector store'
            },
            batch_id: {
              type: 'string',
              description: 'ID of the batch to cancel'
            }
          },
          required: ['vector_store_id', 'batch_id']
        }
      },
      {
        name: 'vector-store-file-batch-files',
        description: 'List files in a file batch',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: {
              type: 'string',
              description: 'ID of the vector store'
            },
            batch_id: {
              type: 'string',
              description: 'ID of the batch'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of files to return (default: 20)'
            },
            filter: {
              type: 'string',
              enum: ['in_progress', 'completed', 'failed', 'cancelled'],
              description: 'Filter files by status'
            }
          },
          required: ['vector_store_id', 'batch_id']
        }
      }
    ];
    
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: { tools }
    };
  }

  /**
   * Handle tools call request
   */
  private async handleToolsCall(request: MCPToolsCallRequest): Promise<MCPToolsCallResponse> {
    if (!this.openaiService) {
      return this.createErrorResponse(request.id, ErrorCodes.INTERNAL_ERROR, 'OpenAI service not initialized') as MCPToolsCallResponse;
    }

    try {
      const { name, arguments: args } = request.params;
      let result: any;

      switch (name) {
        case 'vector-store-create':
          result = await this.openaiService.createVectorStore({
            name: args.name,
            expires_after_days: args.expires_after_days,
            metadata: args.metadata
          });
          break;

        case 'vector-store-list':
          result = await this.openaiService.listVectorStores({
            limit: args.limit,
            order: args.order
          });
          break;

        case 'vector-store-get':
          if (!args.vector_store_id) {
            throw new MCPError(ErrorCodes.INVALID_PARAMS, 'vector_store_id is required');
          }
          result = await this.openaiService.getVectorStore(args.vector_store_id);
          break;

        case 'vector-store-delete':
          if (!args.vector_store_id) {
            throw new MCPError(ErrorCodes.INVALID_PARAMS, 'vector_store_id is required');
          }
          result = await this.openaiService.deleteVectorStore(args.vector_store_id);
          break;

        case 'vector-store-modify':
          if (!args.vector_store_id) {
            throw new MCPError(ErrorCodes.INVALID_PARAMS, 'vector_store_id is required');
          }
          result = await this.openaiService.modifyVectorStore(args.vector_store_id, {
            name: args.name,
            expires_after_days: args.expires_after_days,
            metadata: args.metadata
          });
          break;

        case 'vector-store-file-add':
          if (!args.vector_store_id || !args.file_id) {
            throw new MCPError(ErrorCodes.INVALID_PARAMS, 'vector_store_id and file_id are required');
          }
          result = await this.openaiService.addFileToVectorStore(args.vector_store_id, {
            file_id: args.file_id
          });
          break;

        case 'vector-store-file-list':
          if (!args.vector_store_id) {
            throw new MCPError(ErrorCodes.INVALID_PARAMS, 'vector_store_id is required');
          }
          result = await this.openaiService.listVectorStoreFiles(args.vector_store_id, {
            limit: args.limit,
            filter: args.filter
          });
          break;

        case 'vector-store-file-get':
          if (!args.vector_store_id || !args.file_id) {
            throw new MCPError(ErrorCodes.INVALID_PARAMS, 'vector_store_id and file_id are required');
          }
          result = await this.openaiService.getVectorStoreFile(args.vector_store_id, args.file_id);
          break;

        case 'vector-store-file-content':
          if (!args.vector_store_id || !args.file_id) {
            throw new MCPError(ErrorCodes.INVALID_PARAMS, 'vector_store_id and file_id are required');
          }
          result = await this.openaiService.getVectorStoreFileContent(args.vector_store_id, args.file_id);
          break;

        case 'vector-store-file-update':
          if (!args.vector_store_id || !args.file_id || !args.metadata) {
            throw new MCPError(ErrorCodes.INVALID_PARAMS, 'vector_store_id, file_id, and metadata are required');
          }
          result = await this.openaiService.updateVectorStoreFile(args.vector_store_id, args.file_id, args.metadata);
          break;

        case 'vector-store-file-delete':
          if (!args.vector_store_id || !args.file_id) {
            throw new MCPError(ErrorCodes.INVALID_PARAMS, 'vector_store_id and file_id are required');
          }
          result = await this.openaiService.deleteVectorStoreFile(args.vector_store_id, args.file_id);
          break;

        case 'vector-store-file-batch-create':
          if (!args.vector_store_id || !args.file_ids || !Array.isArray(args.file_ids)) {
            throw new MCPError(ErrorCodes.INVALID_PARAMS, 'vector_store_id and file_ids array are required');
          }
          result = await this.openaiService.createVectorStoreFileBatch(args.vector_store_id, args.file_ids);
          break;

        case 'vector-store-file-batch-get':
          if (!args.vector_store_id || !args.batch_id) {
            throw new MCPError(ErrorCodes.INVALID_PARAMS, 'vector_store_id and batch_id are required');
          }
          result = await this.openaiService.getVectorStoreFileBatch(args.vector_store_id, args.batch_id);
          break;

        case 'vector-store-file-batch-cancel':
          if (!args.vector_store_id || !args.batch_id) {
            throw new MCPError(ErrorCodes.INVALID_PARAMS, 'vector_store_id and batch_id are required');
          }
          result = await this.openaiService.cancelVectorStoreFileBatch(args.vector_store_id, args.batch_id);
          break;

        case 'vector-store-file-batch-files':
          if (!args.vector_store_id || !args.batch_id) {
            throw new MCPError(ErrorCodes.INVALID_PARAMS, 'vector_store_id and batch_id are required');
          }
          result = await this.openaiService.listVectorStoreFileBatchFiles(args.vector_store_id, args.batch_id, {
            limit: args.limit,
            filter: args.filter
          });
          break;

        default:
          throw new MCPError(ErrorCodes.METHOD_NOT_FOUND, `Unknown tool: ${name}`);
      }

      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        }
      };

    } catch (error) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        }
      };
    }
  }

  /**
   * Create error response
   */
  private createErrorResponse(
    id: string | number | null,
    code: number,
    message: string,
    data?: any
  ): JsonRpcResponse {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message,
        data
      }
    };
  }
}