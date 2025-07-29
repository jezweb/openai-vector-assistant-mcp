#!/usr/bin/env node

/**
 * OpenAI Vector Store MCP Server
 * 
 * This is the main entry point for the stdio-based MCP server that provides
 * OpenAI Vector Store operations through the Model Context Protocol.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { MCPHandler } from './mcp-handler.js';

class OpenAIVectorStoreMCPServer {
  private server: Server;
  private mcpHandler: MCPHandler;

  constructor() {
    // Get OpenAI API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Error: OPENAI_API_KEY environment variable is required');
      console.error('');
      console.error('Usage:');
      console.error('  OPENAI_API_KEY=your-api-key npx openai-vector-store-mcp');
      console.error('  or');
      console.error('  export OPENAI_API_KEY=your-api-key');
      console.error('  npx openai-vector-store-mcp');
      process.exit(1);
    }

    this.mcpHandler = new MCPHandler(apiKey);
    this.server = new Server(
      {
        name: 'openai-vector-store-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers(): void {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const response = await this.mcpHandler.handleRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      });

      if (response.error) {
        throw new McpError(ErrorCode.InternalError, response.error.message);
      }

      return {
        tools: response.result?.tools || []
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      const response = await this.mcpHandler.handleRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name,
          arguments: args || {}
        }
      });

      if (response.error) {
        throw new McpError(ErrorCode.InternalError, response.error.message);
      }

      return {
        content: response.result?.content || [
          {
            type: 'text',
            text: 'No content returned'
          }
        ]
      };
    });
  }

  private setupErrorHandling(): void {
    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // Keep the process running
    console.error('OpenAI Vector Store MCP Server running on stdio...');
  }
}

// Start the server
async function main() {
  const server = new OpenAIVectorStoreMCPServer();
  await server.run();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}