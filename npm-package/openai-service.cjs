/**
 * OpenAI Service for Roo-Compatible MCP Server
 * 
 * This service handles all interactions with the OpenAI Vector Store API,
 * providing the 15 core vector store operations with proper error handling
 * and Roo compatibility.
 */

const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const { createReadStream } = require('fs');

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
   * Upload a local file to OpenAI for use with vector stores and assistants
   */
  async uploadFile(request) {
    const { file_path, purpose = 'assistants', filename } = request;
    
    // Validate file exists
    if (!fs.existsSync(file_path)) {
      throw new MCPError(
        ErrorCodes.INVALID_PARAMS,
        `File not found: ${file_path}`,
        { file_path }
      );
    }

    // Get file stats
    const stats = fs.statSync(file_path);
    const fileSize = stats.size;
    
    // Check file size limit (512MB for OpenAI)
    const maxSize = 512 * 1024 * 1024; // 512MB
    if (fileSize > maxSize) {
      throw new MCPError(
        ErrorCodes.INVALID_PARAMS,
        `File size ${fileSize} bytes exceeds maximum allowed size of ${maxSize} bytes`,
        { file_path, file_size: fileSize, max_size: maxSize }
      );
    }

    // Determine MIME type based on file extension
    const ext = path.extname(file_path).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.doc': 'application/msword',
      '.md': 'text/markdown',
      '.json': 'application/json',
      '.csv': 'text/csv',
      '.xml': 'application/xml',
      '.html': 'text/html',
      '.htm': 'text/html'
    };
    
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const actualFilename = filename || path.basename(file_path);

    return await this.makeFileUploadRequest(file_path, {
      purpose,
      filename: actualFilename,
      contentType,
      fileSize
    });
  }

  /**
   * List all uploaded files with filtering options
   */
  async listFiles(request = {}) {
    const params = new URLSearchParams();
    
    if (request.purpose) {
      params.append('purpose', request.purpose);
    }
    if (request.limit) {
      params.append('limit', request.limit.toString());
    }
    if (request.order) {
      params.append('order', request.order);
    }
    if (request.after) {
      params.append('after', request.after);
    }

    const url = `/files${params.toString() ? `?${params.toString()}` : ''}`;
    return await this.makeRequest('GET', url);
  }

  /**
   * Get details about a specific file
   */
  async getFile(fileId) {
    return await this.makeRequest('GET', `/files/${fileId}`);
  }

  /**
   * Delete a file from OpenAI
   */
  async deleteFile(fileId) {
    return await this.makeRequest('DELETE', `/files/${fileId}`);
  }

  /**
   * Download/retrieve file content
   */
  async getFileContent(fileId) {
    return await this.makeRequest('GET', `/files/${fileId}/content`);
  }

  /**
   * Create multipart upload for large files (>25MB)
   */
  async createUpload(request) {
    const { filename, purpose = 'assistants', bytes, mime_type } = request;
    
    const requestBody = {
      filename,
      purpose,
      bytes,
      mime_type
    };

    return await this.makeRequest('POST', '/uploads', requestBody);
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

  /**
   * Make file upload request with multipart/form-data
   */
  async makeFileUploadRequest(filePath, options) {
    return new Promise((resolve, reject) => {
      const { purpose, filename, contentType, fileSize } = options;
      const boundary = `----formdata-mcp-${Date.now()}`;
      const url = new URL(`${this.baseUrl}/files`);
      
      // Create multipart form data
      const formData = [];
      
      // Add purpose field
      formData.push(`--${boundary}\r\n`);
      formData.push(`Content-Disposition: form-data; name="purpose"\r\n\r\n`);
      formData.push(`${purpose}\r\n`);
      
      // Add file field header
      formData.push(`--${boundary}\r\n`);
      formData.push(`Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`);
      formData.push(`Content-Type: ${contentType}\r\n\r\n`);
      
      const formDataPrefix = Buffer.from(formData.join(''));
      const formDataSuffix = Buffer.from(`\r\n--${boundary}--\r\n`);
      
      const totalSize = formDataPrefix.length + fileSize + formDataSuffix.length;
      
      const options_req = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': totalSize,
          'OpenAI-Beta': 'assistants=v2',
          'User-Agent': 'roo-compatible-mcp-server/1.2.0'
        }
      };

      const req = https.request(options_req, (res) => {
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

      // Set timeout (60 seconds for file uploads)
      req.setTimeout(60000);

      // Write form data prefix
      req.write(formDataPrefix);
      
      // Stream the file
      const fileStream = createReadStream(filePath);
      
      fileStream.on('error', (error) => {
        req.destroy();
        reject(new MCPError(
          ErrorCodes.INTERNAL_ERROR,
          `File read error: ${error.message}`,
          { originalError: error, filePath }
        ));
      });
      
      fileStream.on('data', (chunk) => {
        req.write(chunk);
      });
      
      fileStream.on('end', () => {
        // Write form data suffix
        req.write(formDataSuffix);
        req.end();
      });
    });
  }
}

module.exports = { OpenAIService, MCPError, ErrorCodes };