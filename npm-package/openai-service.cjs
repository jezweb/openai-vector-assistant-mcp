/**
 * OpenAI Service for Roo-Compatible MCP Server
 * 
 * This service handles all interactions with the OpenAI Vector Store API,
 * providing the 15 core vector store operations with proper error handling
 * and Roo compatibility.
 */

const https = require('https');
const { URL } = require('url');

class MCPError extends Error {
  constructor(code, message, data = null) {
    super(message);
    this.name = 'MCPError';
    this.code = code;
    this.data = data;
  }
}

const ErrorCodes = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  UNAUTHORIZED: -32001,
  FORBIDDEN: -32002,
  NOT_FOUND: -32003,
  RATE_LIMITED: -32004,
};

class OpenAIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.openai.com/v1';
  }

  /**
   * Create a new vector store
   */
  async createVectorStore(request) {
    const requestBody = {
      name: request.name,
      metadata: request.metadata || {}
    };

    if (request.expires_after_days) {
      requestBody.expires_after = {
        anchor: 'last_active_at',
        days: request.expires_after_days
      };
    }

    return await this.makeRequest('POST', '/vector_stores', requestBody);
  }

  /**
   * List all vector stores
   */
  async listVectorStores(request = {}) {
    const params = new URLSearchParams();
    
    if (request.limit) {
      params.append('limit', request.limit.toString());
    }
    if (request.order) {
      params.append('order', request.order);
    }

    const url = `/vector_stores${params.toString() ? `?${params.toString()}` : ''}`;
    return await this.makeRequest('GET', url);
  }

  /**
   * Get a specific vector store by ID
   */
  async getVectorStore(vectorStoreId) {
    return await this.makeRequest('GET', `/vector_stores/${vectorStoreId}`);
  }

  /**
   * Delete a vector store
   */
  async deleteVectorStore(vectorStoreId) {
    return await this.makeRequest('DELETE', `/vector_stores/${vectorStoreId}`);
  }

  /**
   * Add a file to a vector store
   */
  async addFileToVectorStore(vectorStoreId, request) {
    const requestBody = {
      file_id: request.file_id
    };

    return await this.makeRequest('POST', `/vector_stores/${vectorStoreId}/files`, requestBody);
  }

  /**
   * List files in a vector store
   */
  async listVectorStoreFiles(vectorStoreId, request = {}) {
    const params = new URLSearchParams();
    
    if (request.limit) {
      params.append('limit', request.limit.toString());
    }
    if (request.filter) {
      params.append('filter', request.filter);
    }

    const url = `/vector_stores/${vectorStoreId}/files${params.toString() ? `?${params.toString()}` : ''}`;
    return await this.makeRequest('GET', url);
  }

  /**
   * Delete a file from a vector store
   */
  async deleteVectorStoreFile(vectorStoreId, fileId) {
    return await this.makeRequest('DELETE', `/vector_stores/${vectorStoreId}/files/${fileId}`);
  }

  /**
   * Get a specific file from a vector store
   */
  async getVectorStoreFile(vectorStoreId, fileId) {
    return await this.makeRequest('GET', `/vector_stores/${vectorStoreId}/files/${fileId}`);
  }

  /**
   * Get file content from a vector store
   */
  async getVectorStoreFileContent(vectorStoreId, fileId) {
    return await this.makeRequest('GET', `/vector_stores/${vectorStoreId}/files/${fileId}/content`);
  }

  /**
   * Update a file in a vector store
   */
  async updateVectorStoreFile(vectorStoreId, fileId, metadata) {
    const requestBody = { metadata };
    return await this.makeRequest('PATCH', `/vector_stores/${vectorStoreId}/files/${fileId}`, requestBody);
  }

  /**
   * Modify a vector store
   */
  async modifyVectorStore(vectorStoreId, updates) {
    const requestBody = {};
    
    if (updates.name) {
      requestBody.name = updates.name;
    }
    if (updates.metadata) {
      requestBody.metadata = updates.metadata;
    }
    if (updates.expires_after_days) {
      requestBody.expires_after = {
        anchor: 'last_active_at',
        days: updates.expires_after_days
      };
    }

    return await this.makeRequest('POST', `/vector_stores/${vectorStoreId}`, requestBody);
  }

  /**
   * Create a vector store file batch
   */
  async createVectorStoreFileBatch(vectorStoreId, fileIds) {
    const requestBody = { file_ids: fileIds };
    return await this.makeRequest('POST', `/vector_stores/${vectorStoreId}/file_batches`, requestBody);
  }

  /**
   * Get a vector store file batch
   */
  async getVectorStoreFileBatch(vectorStoreId, batchId) {
    return await this.makeRequest('GET', `/vector_stores/${vectorStoreId}/file_batches/${batchId}`);
  }

  /**
   * Cancel a vector store file batch
   */
  async cancelVectorStoreFileBatch(vectorStoreId, batchId) {
    return await this.makeRequest('POST', `/vector_stores/${vectorStoreId}/file_batches/${batchId}/cancel`);
  }

  /**
   * List files in a vector store file batch
   */
  async listVectorStoreFileBatchFiles(vectorStoreId, batchId, request = {}) {
    const params = new URLSearchParams();
    
    if (request.limit) {
      params.append('limit', request.limit.toString());
    }
    if (request.filter) {
      params.append('filter', request.filter);
    }

    const url = `/vector_stores/${vectorStoreId}/file_batches/${batchId}/files${params.toString() ? `?${params.toString()}` : ''}`;
    return await this.makeRequest('GET', url);
  }

  /**
   * Validate API key by making a simple request
   */
  async validateApiKey() {
    try {
      await this.makeRequest('GET', '/models', undefined, false);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Make HTTP request to OpenAI API using Node.js https module
   */
  async makeRequest(method, endpoint, body = null, throwOnError = true) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
          'User-Agent': 'roo-compatible-mcp-server/1.0.0'
        }
      };

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        const bodyString = JSON.stringify(body);
        options.headers['Content-Length'] = Buffer.byteLength(bodyString);
      }

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
              let errorData = {};
              try {
                errorData = JSON.parse(data);
              } catch (parseError) {
                // Ignore parse errors for error responses
              }

              if (!throwOnError) {
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
              }

              // Map OpenAI error codes to MCP error codes
              let mcpErrorCode = ErrorCodes.INTERNAL_ERROR;
              if (res.statusCode === 401) {
                mcpErrorCode = ErrorCodes.UNAUTHORIZED;
              } else if (res.statusCode === 403) {
                mcpErrorCode = ErrorCodes.FORBIDDEN;
              } else if (res.statusCode === 404) {
                mcpErrorCode = ErrorCodes.NOT_FOUND;
              } else if (res.statusCode === 429) {
                mcpErrorCode = ErrorCodes.RATE_LIMITED;
              }

              const errorMessage = errorData?.error?.message || `OpenAI API error: ${res.statusCode} ${res.statusMessage}`;
              
              reject(new MCPError(
                mcpErrorCode,
                errorMessage,
                errorData
              ));
              return;
            }

            // Parse successful response
            try {
              const result = JSON.parse(data);
              resolve(result);
            } catch (parseError) {
              reject(new MCPError(
                ErrorCodes.INTERNAL_ERROR,
                `Failed to parse OpenAI API response: ${parseError.message}`,
                { originalError: parseError, responseData: data }
              ));
            }
          } catch (error) {
            reject(new MCPError(
              ErrorCodes.INTERNAL_ERROR,
              `Error processing OpenAI API response: ${error.message}`,
              { originalError: error }
            ));
          }
        });
      });

      req.on('error', (error) => {
        reject(new MCPError(
          ErrorCodes.INTERNAL_ERROR,
          `Network error: ${error.message}`,
          { originalError: error }
        ));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new MCPError(
          ErrorCodes.INTERNAL_ERROR,
          'Request timeout',
          { timeout: true }
        ));
      });

      // Set timeout (30 seconds)
      req.setTimeout(30000);

      // Write request body if present
      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }
}

module.exports = { OpenAIService, MCPError, ErrorCodes };