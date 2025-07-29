/**
 * OpenAI Service
 * 
 * This service handles all interactions with the OpenAI Vector Store API,
 * providing the 4 core vector store operations: create, list, get, delete.
 */

import {
  VectorStore,
  CreateVectorStoreRequest,
  ListVectorStoresRequest,
  ListVectorStoresResponse,
  VectorStoreFile,
  VectorStoreFileBatch,
  AddFileToVectorStoreRequest,
  ListVectorStoreFilesRequest,
  ListVectorStoreFilesResponse,
  ModifyVectorStoreRequest,
  VectorStoreFileContent,
  UpdateVectorStoreFileRequest,
  MCPError,
  ErrorCodes
} from './types.js';

export class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Create a new vector store
   */
  async createVectorStore(request: CreateVectorStoreRequest): Promise<VectorStore> {
    const requestBody: any = {
      name: request.name,
      metadata: request.metadata || {}
    };

    if (request.expires_after_days) {
      requestBody.expires_after = {
        anchor: 'last_active_at',
        days: request.expires_after_days
      };
    }

    const response = await this.makeRequest('POST', '/vector_stores', requestBody);
    return response as VectorStore;
  }

  /**
   * List all vector stores
   */
  async listVectorStores(request: ListVectorStoresRequest = {}): Promise<ListVectorStoresResponse> {
    const params = new URLSearchParams();
    
    if (request.limit) {
      params.append('limit', request.limit.toString());
    }
    if (request.order) {
      params.append('order', request.order);
    }

    const url = `/vector_stores${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.makeRequest('GET', url);
    return response as ListVectorStoresResponse;
  }

  /**
   * Get a specific vector store by ID
   */
  async getVectorStore(vectorStoreId: string): Promise<VectorStore> {
    const response = await this.makeRequest('GET', `/vector_stores/${vectorStoreId}`);
    return response as VectorStore;
  }

  /**
   * Delete a vector store
   */
  async deleteVectorStore(vectorStoreId: string): Promise<{ id: string; object: string; deleted: boolean }> {
    const response = await this.makeRequest('DELETE', `/vector_stores/${vectorStoreId}`);
    return response as { id: string; object: string; deleted: boolean };
  }

  /**
   * Add a file to a vector store
   */
  async addFileToVectorStore(vectorStoreId: string, request: AddFileToVectorStoreRequest): Promise<VectorStoreFile> {
    const requestBody = {
      file_id: request.file_id
    };

    const response = await this.makeRequest('POST', `/vector_stores/${vectorStoreId}/files`, requestBody);
    return response as VectorStoreFile;
  }

  /**
   * List files in a vector store
   */
  async listVectorStoreFiles(vectorStoreId: string, request: ListVectorStoreFilesRequest = {}): Promise<ListVectorStoreFilesResponse> {
    const params = new URLSearchParams();
    
    if (request.limit) {
      params.append('limit', request.limit.toString());
    }
    if (request.filter) {
      params.append('filter', request.filter);
    }

    const url = `/vector_stores/${vectorStoreId}/files${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.makeRequest('GET', url);
    return response as ListVectorStoreFilesResponse;
  }

  /**
   * Delete a file from a vector store
   */
  async deleteVectorStoreFile(vectorStoreId: string, fileId: string): Promise<{ id: string; object: string; deleted: boolean }> {
    const response = await this.makeRequest('DELETE', `/vector_stores/${vectorStoreId}/files/${fileId}`);
    return response as { id: string; object: string; deleted: boolean };
  }

  /**
   * Get a specific file from a vector store
   */
  async getVectorStoreFile(vectorStoreId: string, fileId: string): Promise<VectorStoreFile> {
    const response = await this.makeRequest('GET', `/vector_stores/${vectorStoreId}/files/${fileId}`);
    return response as VectorStoreFile;
  }

  /**
   * Get file content from a vector store
   */
  async getVectorStoreFileContent(vectorStoreId: string, fileId: string): Promise<VectorStoreFileContent> {
    const response = await this.makeRequest('GET', `/vector_stores/${vectorStoreId}/files/${fileId}/content`);
    return response as VectorStoreFileContent;
  }

  /**
   * Update a file in a vector store
   */
  async updateVectorStoreFile(vectorStoreId: string, fileId: string, metadata: Record<string, any>): Promise<VectorStoreFile> {
    const requestBody = { metadata };
    const response = await this.makeRequest('PATCH', `/vector_stores/${vectorStoreId}/files/${fileId}`, requestBody);
    return response as VectorStoreFile;
  }

  /**
   * Modify a vector store
   */
  async modifyVectorStore(vectorStoreId: string, updates: ModifyVectorStoreRequest): Promise<VectorStore> {
    const requestBody: any = {};
    
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

    const response = await this.makeRequest('POST', `/vector_stores/${vectorStoreId}`, requestBody);
    return response as VectorStore;
  }

  /**
   * Create a vector store file batch
   */
  async createVectorStoreFileBatch(vectorStoreId: string, fileIds: string[]): Promise<VectorStoreFileBatch> {
    const requestBody = { file_ids: fileIds };
    const response = await this.makeRequest('POST', `/vector_stores/${vectorStoreId}/file_batches`, requestBody);
    return response as VectorStoreFileBatch;
  }

  /**
   * Get a vector store file batch
   */
  async getVectorStoreFileBatch(vectorStoreId: string, batchId: string): Promise<VectorStoreFileBatch> {
    const response = await this.makeRequest('GET', `/vector_stores/${vectorStoreId}/file_batches/${batchId}`);
    return response as VectorStoreFileBatch;
  }

  /**
   * Cancel a vector store file batch
   */
  async cancelVectorStoreFileBatch(vectorStoreId: string, batchId: string): Promise<VectorStoreFileBatch> {
    const response = await this.makeRequest('POST', `/vector_stores/${vectorStoreId}/file_batches/${batchId}/cancel`);
    return response as VectorStoreFileBatch;
  }

  /**
   * List files in a vector store file batch
   */
  async listVectorStoreFileBatchFiles(vectorStoreId: string, batchId: string, request: ListVectorStoreFilesRequest = {}): Promise<ListVectorStoreFilesResponse> {
    const params = new URLSearchParams();
    
    if (request.limit) {
      params.append('limit', request.limit.toString());
    }
    if (request.filter) {
      params.append('filter', request.filter);
    }

    const url = `/vector_stores/${vectorStoreId}/file_batches/${batchId}/files${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.makeRequest('GET', url);
    return response as ListVectorStoreFilesResponse;
  }

  /**
   * Validate API key by making a simple request
   */
  async validateApiKey(): Promise<boolean> {
    try {
      await this.makeRequest('GET', '/models', undefined, false);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Make HTTP request to OpenAI API
   */
  private async makeRequest(method: string, endpoint: string, body?: any, throwOnError: boolean = true): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      }
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (!throwOnError) {
          throw new Error(`HTTP ${response.status}`);
        }

        // Map OpenAI error codes to MCP error codes
        let mcpErrorCode: number = ErrorCodes.INTERNAL_ERROR;
        if (response.status === 401) {
          mcpErrorCode = ErrorCodes.UNAUTHORIZED;
        } else if (response.status === 403) {
          mcpErrorCode = ErrorCodes.FORBIDDEN;
        } else if (response.status === 404) {
          mcpErrorCode = ErrorCodes.NOT_FOUND;
        } else if (response.status === 429) {
          mcpErrorCode = ErrorCodes.RATE_LIMITED;
        }

        const errorMessage = (errorData as any)?.error?.message || `OpenAI API error: ${response.status} ${response.statusText}`;
        
        throw new MCPError(
          mcpErrorCode,
          errorMessage,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof MCPError) {
        throw error;
      }
      
      throw new MCPError(
        ErrorCodes.INTERNAL_ERROR,
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { originalError: error }
      );
    }
  }
}