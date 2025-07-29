#!/usr/bin/env node

/**
 * Roo-Compatible MCP Server
 * 
 * This server addresses specific protocol violations and formatting issues
 * identified in research for Roo compatibility:
 * - Proper JSON-RPC message formatting with UTF-8 encoding and newline delimiters
 * - Correct initialization handshake sequence that Roo expects
 * - Proper error handling to prevent crashes that cause connection issues
 * - Stdout line-buffered for Roo compatibility
 * - Handles empty line handshake that Roo sends
 * - Sends immediate server info notification that Roo expects
 */

const readline = require('readline');
const { OpenAIService } = require('./openai-service.cjs');

class RooCompatibleMCPServer {
  constructor() {
    this.openaiService = null;
    this.isInitialized = false;
    this.debug = process.env.DEBUG === 'true';
    
    // Ensure stdout is line-buffered for Roo compatibility
    process.stdout.setEncoding('utf8');
    if (process.stdout.isTTY) {
      process.stdout._flush = process.stdout._flush || (() => {});
    }
    
    this.setupErrorHandling();
    this.setupStdioInterface();
    this.logDebug('Server starting...');
  }

  setupErrorHandling() {
    // Prevent crashes that cause connection issues with Roo
    process.on('uncaughtException', (error) => {
      this.logError('Uncaught exception:', error);
      this.sendErrorResponse(null, -32603, 'Internal server error', error.message);
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.logError('Unhandled rejection at:', promise, 'reason:', reason);
      this.sendErrorResponse(null, -32603, 'Internal server error', String(reason));
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      this.logDebug('Received SIGTERM, shutting down gracefully');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      this.logDebug('Received SIGINT, shutting down gracefully');
      process.exit(0);
    });
  }

  setupStdioInterface() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    rl.on('line', (line) => {
      this.handleInput(line.trim());
    });

    rl.on('close', () => {
      this.logDebug('Stdin closed, exiting');
      process.exit(0);
    });
  }

  async handleInput(line) {
    try {
      // Handle empty line handshake that Roo sends
      if (line === '') {
        this.logDebug('Received empty line handshake from Roo');
        return;
      }

      this.logDebug('Received input:', line);

      // Parse JSON-RPC message
      let request;
      try {
        request = JSON.parse(line);
      } catch (parseError) {
        this.logError('JSON parse error:', parseError);
        this.sendErrorResponse(null, -32700, 'Parse error', parseError.message);
        return;
      }

      // Validate JSON-RPC 2.0 format
      if (request.jsonrpc !== '2.0') {
        this.sendErrorResponse(request.id, -32600, 'Invalid Request', 'Invalid JSON-RPC version');
        return;
      }

      // Route request to appropriate handler
      await this.routeRequest(request);

    } catch (error) {
      this.logError('Error handling input:', error);
      this.sendErrorResponse(null, -32603, 'Internal error', error.message);
    }
  }

  async routeRequest(request) {
    const { method, params, id } = request;

    try {
      switch (method) {
        case 'initialize':
          await this.handleInitialize(request);
          break;
        case 'tools/list':
          await this.handleToolsList(request);
          break;
        case 'tools/call':
          await this.handleToolsCall(request);
          break;
        default:
          this.sendErrorResponse(id, -32601, 'Method not found', `Unknown method: ${method}`);
      }
    } catch (error) {
      this.logError(`Error in ${method}:`, error);
      this.sendErrorResponse(id, -32603, 'Internal error', error.message);
    }
  }

  async handleInitialize(request) {
    const { params, id } = request;
    
    this.logDebug('Handling initialize request:', params);

    // Validate API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.sendErrorResponse(id, -32602, 'Invalid params', 'OPENAI_API_KEY environment variable is required');
      return;
    }

    // Initialize OpenAI service
    try {
      this.openaiService = new OpenAIService(apiKey);
      
      // Validate API key by making a test request
      const isValid = await this.openaiService.validateApiKey();
      if (!isValid) {
        this.sendErrorResponse(id, -32001, 'Unauthorized', 'Invalid OpenAI API key');
        return;
      }

      this.isInitialized = true;
      this.logDebug('OpenAI service initialized successfully');

    } catch (error) {
      this.logError('Failed to initialize OpenAI service:', error);
      this.sendErrorResponse(id, -32603, 'Internal error', 'Failed to initialize OpenAI service');
      return;
    }

    // Send initialization response
    const response = {
      jsonrpc: '2.0',
      id: id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {
            listChanged: false
          }
        },
        serverInfo: {
          name: 'roo-compatible-openai-vector-store-mcp',
          version: '1.0.0'
        }
      }
    };

    this.sendResponse(response);

    // Send immediate server info notification that Roo expects
    const notification = {
      jsonrpc: '2.0',
      method: 'notifications/initialized',
      params: {}
    };

    this.sendResponse(notification);
    this.logDebug('Initialization complete');
  }

  async handleToolsList(request) {
    if (!this.isInitialized) {
      this.sendErrorResponse(request.id, -32002, 'Server not initialized', 'Call initialize first');
      return;
    }

    const tools = [
      {
        name: 'vector-store-create',
        description: 'Create a new vector store',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Name of the vector store' },
            expires_after_days: { type: 'number', description: 'Number of days after which the vector store expires (optional)' },
            metadata: { type: 'object', description: 'Additional metadata for the vector store (optional)' }
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
            limit: { type: 'number', description: 'Maximum number of vector stores to return (default: 20)' },
            order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort order by created_at timestamp' }
          }
        }
      },
      {
        name: 'vector-store-get',
        description: 'Get details of a specific vector store',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: { type: 'string', description: 'ID of the vector store to retrieve' }
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
            vector_store_id: { type: 'string', description: 'ID of the vector store to delete' }
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
            vector_store_id: { type: 'string', description: 'ID of the vector store to modify' },
            name: { type: 'string', description: 'New name for the vector store (optional)' },
            expires_after_days: { type: 'number', description: 'Number of days after which the vector store expires (optional)' },
            metadata: { type: 'object', description: 'Additional metadata for the vector store (optional)' }
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
            vector_store_id: { type: 'string', description: 'ID of the vector store' },
            file_id: { type: 'string', description: 'ID of the file to add' }
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
            vector_store_id: { type: 'string', description: 'ID of the vector store' },
            limit: { type: 'number', description: 'Maximum number of files to return (default: 20)' },
            filter: { type: 'string', enum: ['in_progress', 'completed', 'failed', 'cancelled'], description: 'Filter files by status' }
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
            vector_store_id: { type: 'string', description: 'ID of the vector store' },
            file_id: { type: 'string', description: 'ID of the file to retrieve' }
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
            vector_store_id: { type: 'string', description: 'ID of the vector store' },
            file_id: { type: 'string', description: 'ID of the file to get content from' }
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
            vector_store_id: { type: 'string', description: 'ID of the vector store' },
            file_id: { type: 'string', description: 'ID of the file to update' },
            metadata: { type: 'object', description: 'New metadata for the file' }
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
            vector_store_id: { type: 'string', description: 'ID of the vector store' },
            file_id: { type: 'string', description: 'ID of the file to delete' }
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
            vector_store_id: { type: 'string', description: 'ID of the vector store' },
            file_ids: { type: 'array', items: { type: 'string' }, description: 'Array of file IDs to add to the batch' }
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
            vector_store_id: { type: 'string', description: 'ID of the vector store' },
            batch_id: { type: 'string', description: 'ID of the batch to retrieve' }
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
            vector_store_id: { type: 'string', description: 'ID of the vector store' },
            batch_id: { type: 'string', description: 'ID of the batch to cancel' }
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
            vector_store_id: { type: 'string', description: 'ID of the vector store' },
            batch_id: { type: 'string', description: 'ID of the batch' },
            limit: { type: 'number', description: 'Maximum number of files to return (default: 20)' },
            filter: { type: 'string', enum: ['in_progress', 'completed', 'failed', 'cancelled'], description: 'Filter files by status' }
          },
          required: ['vector_store_id', 'batch_id']
        }
      }
    ];

    const response = {
      jsonrpc: '2.0',
      id: request.id,
      result: { tools }
    };

    this.sendResponse(response);
  }

  async handleToolsCall(request) {
    if (!this.isInitialized) {
      this.sendErrorResponse(request.id, -32002, 'Server not initialized', 'Call initialize first');
      return;
    }

    const { name, arguments: args } = request.params;
    this.logDebug(`Calling tool: ${name}`, args);

    try {
      let result;

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
            throw new Error('vector_store_id is required');
          }
          result = await this.openaiService.getVectorStore(args.vector_store_id);
          break;

        case 'vector-store-delete':
          if (!args.vector_store_id) {
            throw new Error('vector_store_id is required');
          }
          result = await this.openaiService.deleteVectorStore(args.vector_store_id);
          break;

        case 'vector-store-modify':
          if (!args.vector_store_id) {
            throw new Error('vector_store_id is required');
          }
          result = await this.openaiService.modifyVectorStore(args.vector_store_id, {
            name: args.name,
            expires_after_days: args.expires_after_days,
            metadata: args.metadata
          });
          break;

        case 'vector-store-file-add':
          if (!args.vector_store_id || !args.file_id) {
            throw new Error('vector_store_id and file_id are required');
          }
          result = await this.openaiService.addFileToVectorStore(args.vector_store_id, {
            file_id: args.file_id
          });
          break;

        case 'vector-store-file-list':
          if (!args.vector_store_id) {
            throw new Error('vector_store_id is required');
          }
          result = await this.openaiService.listVectorStoreFiles(args.vector_store_id, {
            limit: args.limit,
            filter: args.filter
          });
          break;

        case 'vector-store-file-get':
          if (!args.vector_store_id || !args.file_id) {
            throw new Error('vector_store_id and file_id are required');
          }
          result = await this.openaiService.getVectorStoreFile(args.vector_store_id, args.file_id);
          break;

        case 'vector-store-file-content':
          if (!args.vector_store_id || !args.file_id) {
            throw new Error('vector_store_id and file_id are required');
          }
          result = await this.openaiService.getVectorStoreFileContent(args.vector_store_id, args.file_id);
          break;

        case 'vector-store-file-update':
          if (!args.vector_store_id || !args.file_id || !args.metadata) {
            throw new Error('vector_store_id, file_id, and metadata are required');
          }
          result = await this.openaiService.updateVectorStoreFile(args.vector_store_id, args.file_id, args.metadata);
          break;

        case 'vector-store-file-delete':
          if (!args.vector_store_id || !args.file_id) {
            throw new Error('vector_store_id and file_id are required');
          }
          result = await this.openaiService.deleteVectorStoreFile(args.vector_store_id, args.file_id);
          break;

        case 'vector-store-file-batch-create':
          if (!args.vector_store_id || !args.file_ids || !Array.isArray(args.file_ids)) {
            throw new Error('vector_store_id and file_ids array are required');
          }
          result = await this.openaiService.createVectorStoreFileBatch(args.vector_store_id, args.file_ids);
          break;

        case 'vector-store-file-batch-get':
          if (!args.vector_store_id || !args.batch_id) {
            throw new Error('vector_store_id and batch_id are required');
          }
          result = await this.openaiService.getVectorStoreFileBatch(args.vector_store_id, args.batch_id);
          break;

        case 'vector-store-file-batch-cancel':
          if (!args.vector_store_id || !args.batch_id) {
            throw new Error('vector_store_id and batch_id are required');
          }
          result = await this.openaiService.cancelVectorStoreFileBatch(args.vector_store_id, args.batch_id);
          break;

        case 'vector-store-file-batch-files':
          if (!args.vector_store_id || !args.batch_id) {
            throw new Error('vector_store_id and batch_id are required');
          }
          result = await this.openaiService.listVectorStoreFileBatchFiles(args.vector_store_id, args.batch_id, {
            limit: args.limit,
            filter: args.filter
          });
          break;

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      const response = {
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

      this.sendResponse(response);

    } catch (error) {
      this.logError(`Tool call error for ${name}:`, error);
      
      const response = {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        }
      };

      this.sendResponse(response);
    }
  }

  sendResponse(response) {
    // Ensure messages are UTF-8 encoded and delimited by newlines
    // Messages MUST NOT contain embedded newlines
    const message = JSON.stringify(response);
    
    // Validate no embedded newlines
    if (message.includes('\n') || message.includes('\r')) {
      this.logError('Response contains embedded newlines, this will break Roo compatibility');
      // Remove embedded newlines to prevent protocol violation
      const cleanMessage = message.replace(/[\n\r]/g, ' ');
      process.stdout.write(cleanMessage + '\n');
    } else {
      process.stdout.write(message + '\n');
    }
    
    this.logDebug('Sent response:', message);
  }

  sendErrorResponse(id, code, message, data = null) {
    const response = {
      jsonrpc: '2.0',
      id: id,
      error: {
        code: code,
        message: message,
        ...(data && { data: data })
      }
    };

    this.sendResponse(response);
  }

  logDebug(...args) {
    if (this.debug) {
      console.error('[DEBUG]', ...args);
    }
  }

  logError(...args) {
    console.error('[ERROR]', ...args);
  }
}

// Environment validation
function validateEnvironment() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('[ERROR] OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  if (!apiKey.startsWith('sk-')) {
    console.error('[ERROR] OPENAI_API_KEY must be a valid OpenAI API key starting with "sk-"');
    process.exit(1);
  }

  console.error('[INFO] Environment validation passed');
}

// Start the server
if (require.main === module) {
  validateEnvironment();
  new RooCompatibleMCPServer();
}

module.exports = { RooCompatibleMCPServer };