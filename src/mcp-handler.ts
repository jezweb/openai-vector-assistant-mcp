/**
 * MCP Protocol Handler
 * 
 * This file implements the core Model Context Protocol (MCP) message handling
 * and routing logic for the Cloudflare Worker with vector store operations.
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
} from './types';
import { OpenAIService } from './services/openai-service';

export class MCPHandler {
  private openaiService: OpenAIService;

  constructor(apiKey: string) {
    this.openaiService = new OpenAIService(apiKey);
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
          name: 'mcp-server-cloudflare',
          version: '1.2.0'
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
      },
      {
        name: 'file-upload',
        description: 'Upload a local file to OpenAI for use with vector stores and assistants. This enables the complete workflow: upload file → add to vector store.',
        inputSchema: {
          type: 'object',
          properties: {
            file_path: {
              type: 'string',
              description: 'Path to the local file to upload (e.g., "./documents/manual.pdf", "/home/user/data.txt")'
            },
            purpose: {
              type: 'string',
              enum: ['assistants', 'vision', 'batch'],
              description: 'Purpose of the file upload. Use "assistants" for vector stores and chat.'
            },
            filename: {
              type: 'string',
              description: 'Optional custom filename for the uploaded file. If not provided, uses the original filename.'
            }
          },
          required: ['file_path']
        }
      },
      {
        name: 'file-list',
        description: 'List all uploaded files in your OpenAI account with filtering options. Essential for managing your file storage and finding file IDs for vector store operations.',
        inputSchema: {
          type: 'object',
          properties: {
            purpose: {
              type: 'string',
              enum: ['assistants', 'vision', 'batch'],
              description: 'Filter files by purpose. Use "assistants" to see files available for vector stores.'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of files to return (1-10000, default: 20)'
            },
            order: {
              type: 'string',
              enum: ['asc', 'desc'],
              description: 'Sort order by created_at: "desc" for newest first, "asc" for oldest first'
            },
            after: {
              type: 'string',
              description: 'File ID to start listing after (for pagination)'
            }
          }
        }
      },
      {
        name: 'file-get',
        description: 'Get detailed information about a specific uploaded file including size, purpose, creation date, and processing status. Use this to verify file details before adding to vector stores.',
        inputSchema: {
          type: 'object',
          properties: {
            file_id: {
              type: 'string',
              description: 'OpenAI file ID to retrieve details for (starts with "file-")'
            }
          },
          required: ['file_id']
        }
      },
      {
        name: 'file-delete',
        description: 'Permanently delete a file from your OpenAI account. This will remove the file from all vector stores and make it unavailable for future use. Use with caution as this action cannot be undone.',
        inputSchema: {
          type: 'object',
          properties: {
            file_id: {
              type: 'string',
              description: 'OpenAI file ID to delete (starts with "file-"). Double-check this ID as deletion is irreversible.'
            }
          },
          required: ['file_id']
        }
      },
      {
        name: 'file-content',
        description: 'Download and retrieve the actual content of an uploaded file. Perfect for reviewing file contents, verifying uploads, or extracting text for analysis.',
        inputSchema: {
          type: 'object',
          properties: {
            file_id: {
              type: 'string',
              description: 'OpenAI file ID to download content from (starts with "file-")'
            }
          },
          required: ['file_id']
        }
      },
      {
        name: 'upload-create',
        description: 'Create a multipart upload session for large files (>25MB). This enables efficient upload of large documents by splitting them into chunks. Use this for files that exceed the standard upload limit.',
        inputSchema: {
          type: 'object',
          properties: {
            filename: {
              type: 'string',
              description: 'Name of the file to upload (e.g., "large-dataset.pdf")'
            },
            purpose: {
              type: 'string',
              enum: ['assistants', 'vision', 'batch'],
              description: 'Purpose of the file upload. Use "assistants" for vector stores.'
            },
            bytes: {
              type: 'number',
              description: 'Total size of the file in bytes'
            },
            mime_type: {
              type: 'string',
              description: 'MIME type of the file (e.g., "application/pdf", "text/plain")'
            }
          },
          required: ['filename', 'bytes', 'mime_type']
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

        case 'file-upload':
          if (!args.file_path) {
            throw new MCPError(ErrorCodes.INVALID_PARAMS, 'file_path is required');
          }
          result = await this.openaiService.uploadFile({
            file_path: args.file_path,
            purpose: args.purpose,
            filename: args.filename
          });
          break;

        case 'file-list':
          result = await this.openaiService.listFiles({
            purpose: args.purpose,
            limit: args.limit,
            order: args.order,
            after: args.after
          });
          break;

        case 'file-get':
          if (!args.file_id) {
            throw new MCPError(ErrorCodes.INVALID_PARAMS, 'file_id is required');
          }
          result = await this.openaiService.getFile(args.file_id);
          break;

        case 'file-delete':
          if (!args.file_id) {
            throw new MCPError(ErrorCodes.INVALID_PARAMS, 'file_id is required');
          }
          result = await this.openaiService.deleteFile(args.file_id);
          break;

        case 'file-content':
          if (!args.file_id) {
            throw new MCPError(ErrorCodes.INVALID_PARAMS, 'file_id is required');
          }
          result = await this.openaiService.getFileContent(args.file_id);
          break;

        case 'upload-create':
          if (!args.filename || !args.bytes || !args.mime_type) {
            throw new MCPError(ErrorCodes.INVALID_PARAMS, 'filename, bytes, and mime_type are required');
          }
          result = await this.openaiService.createUpload({
            filename: args.filename,
            purpose: args.purpose,
            bytes: args.bytes,
            mime_type: args.mime_type
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