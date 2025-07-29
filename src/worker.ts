/**
 * Cloudflare Worker Entry Point
 * 
 * Main entry point for the MCP server running on Cloudflare Workers.
 * Handles routing, authentication, CORS, and integrates with the MCP handler.
 */

import { JsonRpcRequest, JsonRpcResponse, Env, ErrorCodes } from './types';
import { MCPHandler } from './mcp-handler';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    try {
      const url = new URL(request.url);
      
      // Health check endpoint
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          service: 'mcp-server-cloudflare'
        }), {
          status: 200,
          headers: getCORSHeaders('application/json')
        });
      }

      // Extract API key from URL path: /mcp/{api-key}
      const pathMatch = url.pathname.match(/^\/mcp\/([^\/]+)$/);
      if (!pathMatch) {
        return createErrorResponse(
          ErrorCodes.UNAUTHORIZED,
          'Invalid endpoint. Use /mcp/{api-key} format',
          400
        );
      }

      const apiKey = pathMatch[1];

      // Only allow POST requests for MCP
      if (request.method !== 'POST') {
        return createErrorResponse(
          ErrorCodes.INVALID_REQUEST,
          'Only POST requests are allowed',
          405
        );
      }

      // Parse JSON-RPC request
      let jsonRpcRequest: JsonRpcRequest;
      try {
        const body = await request.text();
        if (!body) {
          return createErrorResponse(
            ErrorCodes.INVALID_REQUEST,
            'Request body is required',
            400
          );
        }
        
        jsonRpcRequest = JSON.parse(body);
      } catch (error) {
        return createErrorResponse(
          ErrorCodes.PARSE_ERROR,
          'Invalid JSON in request body',
          400
        );
      }

      // Validate JSON-RPC format
      if (!jsonRpcRequest.jsonrpc || jsonRpcRequest.jsonrpc !== '2.0') {
        return createErrorResponse(
          ErrorCodes.INVALID_REQUEST,
          'Invalid JSON-RPC 2.0 format',
          400
        );
      }

      if (!jsonRpcRequest.method) {
        return createErrorResponse(
          ErrorCodes.INVALID_REQUEST,
          'Method is required',
          400
        );
      }

      // Create MCP handler with the provided API key
      const mcpHandler = new MCPHandler(apiKey);
      
      // Handle the MCP request
      const response = await mcpHandler.handleRequest(jsonRpcRequest);
      
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: getCORSHeaders('application/json')
      });

    } catch (error) {
      console.error('Worker error:', error);
      
      return createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Internal server error',
        500
      );
    }
  }
};

/**
 * Handle CORS preflight requests
 */
function handleCORS(): Response {
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders()
  });
}

/**
 * Get CORS headers
 */
function getCORSHeaders(contentType?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };

  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  return headers;
}

/**
 * Create error response
 */
function createErrorResponse(code: number, message: string, httpStatus: number): Response {
  const errorResponse: JsonRpcResponse = {
    jsonrpc: '2.0',
    id: null,
    error: {
      code,
      message
    }
  };

  return new Response(JSON.stringify(errorResponse), {
    status: httpStatus,
    headers: getCORSHeaders('application/json')
  });
}