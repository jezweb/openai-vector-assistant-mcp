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

    // Get API key from environment (will be set by MCP client)
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Initialize without API key validation - validation happens when tools are called
    if (apiKey) {
      try {
        this.openaiService = new OpenAIService(apiKey);
        this.logDebug('OpenAI service initialized with API key');
      } catch (error) {
        this.logError('Failed to initialize OpenAI service:', error);
        // Don't fail initialization - just log the error
      }
    } else {
      this.logDebug('No API key provided during initialization - will validate when tools are called');
    }

    this.isInitialized = true;

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
          version: '1.2.0'
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
        description: 'Create a new vector store for organizing and searching through files. Perfect for setting up document collections, knowledge bases, or project-specific file repositories. Use this when starting a new project that needs file search capabilities.',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Descriptive name for the vector store (e.g., "Project Documentation", "Research Papers", "Customer Support KB")' },
            expires_after_days: { type: 'number', description: 'Auto-deletion after specified days (1-365). Useful for temporary projects or testing. Leave empty for permanent storage.' },
            metadata: { type: 'object', description: 'Custom metadata for organization (e.g., {"project": "alpha", "department": "engineering", "version": "1.0"})' }
          },
          required: ['name']
        }
      },
      {
        name: 'vector-store-list',
        description: 'Retrieve all your vector stores with their details, file counts, and status. Essential for managing multiple projects and understanding your storage usage. Shows creation dates, expiration times, and file statistics.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Maximum results to return (1-100, default: 20). Use smaller limits for quick overviews, larger for comprehensive audits.' },
            order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort by creation date: "desc" for newest first (default), "asc" for oldest first' }
          }
        }
      },
      {
        name: 'vector-store-get',
        description: 'Get comprehensive details about a specific vector store including file count, processing status, expiration date, metadata, and usage statistics. Use this to monitor store health and understand its current state.',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: { type: 'string', description: 'Unique identifier of the vector store (starts with "vs_"). Find this ID using vector-store-list.' }
          },
          required: ['vector_store_id']
        }
      },
      {
        name: 'vector-store-delete',
        description: 'Permanently delete a vector store and all its associated files. This action cannot be undone. Use for cleanup, project completion, or when storage limits are reached. All files in the store will be removed.',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: { type: 'string', description: 'ID of the vector store to permanently delete. Double-check this ID as deletion is irreversible.' }
          },
          required: ['vector_store_id']
        }
      },
      {
        name: 'vector-store-modify',
        description: 'Update vector store properties like name, expiration date, or metadata. Perfect for renaming projects, extending deadlines, or updating organizational tags. Only specified fields will be changed.',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: { type: 'string', description: 'ID of the vector store to modify' },
            name: { type: 'string', description: 'New descriptive name (e.g., rename "Test Store" to "Production Knowledge Base")' },
            expires_after_days: { type: 'number', description: 'New expiration period in days from now (1-365), or null to remove expiration' },
            metadata: { type: 'object', description: 'Updated metadata object. This replaces existing metadata entirely.' }
          },
          required: ['vector_store_id']
        }
      },
      {
        name: 'vector-store-file-add',
        description: 'Add a previously uploaded file to a vector store for search and retrieval. The file must already exist in your OpenAI account (uploaded via Files API). This enables the file to be searched and referenced in conversations.',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: { type: 'string', description: 'Target vector store ID where the file will be added' },
            file_id: { type: 'string', description: 'OpenAI file ID (starts with "file-") of an already uploaded file. Get this from the Files API or OpenAI dashboard.' }
          },
          required: ['vector_store_id', 'file_id']
        }
      },
      {
        name: 'vector-store-file-list',
        description: 'List all files in a vector store with their processing status, metadata, and usage statistics. Essential for monitoring file processing progress and managing store contents. Shows which files are ready for search.',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: { type: 'string', description: 'Vector store ID to list files from' },
            limit: { type: 'number', description: 'Maximum files to return (1-100, default: 20). Use pagination for large stores.' },
            filter: { type: 'string', enum: ['in_progress', 'completed', 'failed', 'cancelled'], description: 'Filter by processing status: "completed" for ready files, "in_progress" for processing, "failed" for errors' }
          },
          required: ['vector_store_id']
        }
      },
      {
        name: 'vector-store-file-get',
        description: 'Get detailed information about a specific file in a vector store including processing status, chunk count, error details, and metadata. Use this to troubleshoot file processing issues or verify file readiness.',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: { type: 'string', description: 'Vector store containing the file' },
            file_id: { type: 'string', description: 'File ID to get details for (starts with "file-")' }
          },
          required: ['vector_store_id', 'file_id']
        }
      },
      {
        name: 'vector-store-file-content',
        description: 'Retrieve the actual content/text of a file stored in a vector store. Perfect for reviewing file contents, debugging search issues, or extracting specific information. Returns the processed text that is used for search.',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: { type: 'string', description: 'Vector store containing the file' },
            file_id: { type: 'string', description: 'File ID to retrieve content from (starts with "file-")' }
          },
          required: ['vector_store_id', 'file_id']
        }
      },
      {
        name: 'vector-store-file-update',
        description: 'Update the metadata associated with a file in a vector store. Useful for adding tags, categories, version numbers, or other organizational information. Does not change the file content, only its metadata.',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: { type: 'string', description: 'Vector store containing the file' },
            file_id: { type: 'string', description: 'File ID to update metadata for' },
            metadata: { type: 'object', description: 'New metadata object (e.g., {"category": "manual", "version": "2.1", "author": "team-alpha"})' }
          },
          required: ['vector_store_id', 'file_id', 'metadata']
        }
      },
      {
        name: 'vector-store-file-delete',
        description: 'Remove a file from a vector store permanently. The file will no longer be searchable or accessible through this store. The original file in your OpenAI account remains unchanged - only the vector store association is removed.',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: { type: 'string', description: 'Vector store to remove the file from' },
            file_id: { type: 'string', description: 'File ID to remove from the store (starts with "file-")' }
          },
          required: ['vector_store_id', 'file_id']
        }
      },
      {
        name: 'vector-store-file-batch-create',
        description: 'Create a batch operation to add multiple files to a vector store simultaneously. Much more efficient than adding files one by one. Perfect for bulk uploads, project migrations, or when adding large document collections. Provides a single operation to track.',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: { type: 'string', description: 'Target vector store for the batch operation' },
            file_ids: { type: 'array', items: { type: 'string' }, description: 'Array of file IDs to add (e.g., ["file-abc123", "file-def456"]). All files must already exist in your OpenAI account.' }
          },
          required: ['vector_store_id', 'file_ids']
        }
      },
      {
        name: 'vector-store-file-batch-get',
        description: 'Check the status and progress of a batch file operation. Shows how many files have been processed, completed, or failed. Essential for monitoring long-running batch operations and identifying any processing issues.',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: { type: 'string', description: 'Vector store containing the batch' },
            batch_id: { type: 'string', description: 'Batch operation ID to check (starts with "vsfb-"). Get this from vector-store-file-batch-create.' }
          },
          required: ['vector_store_id', 'batch_id']
        }
      },
      {
        name: 'vector-store-file-batch-cancel',
        description: 'Cancel a running batch operation before it completes. Useful when you need to stop a large batch due to errors, changed requirements, or resource constraints. Files already processed will remain in the vector store.',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: { type: 'string', description: 'Vector store containing the batch to cancel' },
            batch_id: { type: 'string', description: 'Batch operation ID to cancel (starts with "vsfb-")' }
          },
          required: ['vector_store_id', 'batch_id']
        }
      },
      {
        name: 'vector-store-file-batch-files',
        description: 'List all files in a specific batch operation with their individual processing status. Perfect for detailed monitoring, troubleshooting failed files, or getting a complete audit of batch results. Shows which files succeeded or failed.',
        inputSchema: {
          type: 'object',
          properties: {
            vector_store_id: { type: 'string', description: 'Vector store containing the batch' },
            batch_id: { type: 'string', description: 'Batch operation ID to list files from' },
            limit: { type: 'number', description: 'Maximum files to return (1-100, default: 20). Use pagination for large batches.' },
            filter: { type: 'string', enum: ['in_progress', 'completed', 'failed', 'cancelled'], description: 'Filter by file status: "failed" to see errors, "completed" for successful files' }
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
            file_path: { type: 'string', description: 'Path to the local file to upload (e.g., "./documents/manual.pdf", "/home/user/data.txt")' },
            purpose: { type: 'string', enum: ['assistants', 'vision', 'batch'], description: 'Purpose of the file upload. Use "assistants" for vector stores and chat.' },
            filename: { type: 'string', description: 'Optional custom filename for the uploaded file. If not provided, uses the original filename.' }
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
            purpose: { type: 'string', enum: ['assistants', 'vision', 'batch'], description: 'Filter files by purpose. Use "assistants" to see files available for vector stores.' },
            limit: { type: 'number', description: 'Maximum number of files to return (1-10000, default: 20)' },
            order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort order by created_at: "desc" for newest first, "asc" for oldest first' },
            after: { type: 'string', description: 'File ID to start listing after (for pagination)' }
          }
        }
      },
      {
        name: 'file-get',
        description: 'Get detailed information about a specific uploaded file including size, purpose, creation date, and processing status. Use this to verify file details before adding to vector stores.',
        inputSchema: {
          type: 'object',
          properties: {
            file_id: { type: 'string', description: 'OpenAI file ID to retrieve details for (starts with "file-")' }
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
            file_id: { type: 'string', description: 'OpenAI file ID to delete (starts with "file-"). Double-check this ID as deletion is irreversible.' }
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
            file_id: { type: 'string', description: 'OpenAI file ID to download content from (starts with "file-")' }
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
            filename: { type: 'string', description: 'Name of the file to upload (e.g., "large-dataset.pdf")' },
            purpose: { type: 'string', enum: ['assistants', 'vision', 'batch'], description: 'Purpose of the file upload. Use "assistants" for vector stores.' },
            bytes: { type: 'number', description: 'Total size of the file in bytes' },
            mime_type: { type: 'string', description: 'MIME type of the file (e.g., "application/pdf", "text/plain")' }
          },
          required: ['filename', 'bytes', 'mime_type']
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

    // Validate API key when tools are actually called
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.sendErrorResponse(request.id, -32602, 'Invalid params', 'OPENAI_API_KEY environment variable is required. Please configure it in your MCP client.');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      this.sendErrorResponse(request.id, -32602, 'Invalid params', 'OPENAI_API_KEY must be a valid OpenAI API key starting with "sk-"');
      return;
    }

    // Initialize OpenAI service if not already done or if API key changed
    if (!this.openaiService || this.openaiService.apiKey !== apiKey) {
      try {
        this.openaiService = new OpenAIService(apiKey);
        this.logDebug('OpenAI service initialized/updated with API key');
      } catch (error) {
        this.logError('Failed to initialize OpenAI service:', error);
        this.sendErrorResponse(request.id, -32603, 'Internal error', 'Failed to initialize OpenAI service');
        return;
      }
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

        case 'file-upload':
          if (!args.file_path) {
            throw new Error('file_path is required');
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
            throw new Error('file_id is required');
          }
          result = await this.openaiService.getFile(args.file_id);
          break;

        case 'file-delete':
          if (!args.file_id) {
            throw new Error('file_id is required');
          }
          result = await this.openaiService.deleteFile(args.file_id);
          break;

        case 'file-content':
          if (!args.file_id) {
            throw new Error('file_id is required');
          }
          result = await this.openaiService.getFileContent(args.file_id);
          break;

        case 'upload-create':
          if (!args.filename || !args.bytes || !args.mime_type) {
            throw new Error('filename, bytes, and mime_type are required');
          }
          result = await this.openaiService.createUpload({
            filename: args.filename,
            purpose: args.purpose,
            bytes: args.bytes,
            mime_type: args.mime_type
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

// Start the server
if (require.main === module) {
  console.error('[INFO] Starting OpenAI Vector Store MCP Server...');
  console.error('[INFO] API key will be validated when tools are called');
  new RooCompatibleMCPServer();
}

module.exports = { RooCompatibleMCPServer };