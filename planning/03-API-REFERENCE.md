# OpenAI Vector Store API Reference

## Overview

This document provides the essential OpenAI Vector Store API information needed to implement the MCP server. It covers the specific endpoints, request/response formats, and error handling patterns.

## Base Configuration

### API Base URL
```
https://api.openai.com/v1
```

### Authentication
```
Authorization: Bearer {OPENAI_API_KEY}
```

### Content Type
```
Content-Type: application/json
```

## Vector Store Endpoints

### 1. Create Vector Store
**Endpoint:** `POST /vector_stores`

**Request Body:**
```json
{
  "name": "My Vector Store",
  "expires_after": {
    "anchor": "last_active_at",
    "days": 7
  },
  "metadata": {
    "purpose": "testing",
    "created_by": "mcp_server"
  }
}
```

**Response:**
```json
{
  "id": "vs_abc123",
  "object": "vector_store",
  "created_at": 1699061776,
  "name": "My Vector Store",
  "description": null,
  "usage_bytes": 0,
  "file_counts": {
    "in_progress": 0,
    "completed": 0,
    "failed": 0,
    "cancelled": 0,
    "total": 0
  },
  "status": "completed",
  "expires_after": {
    "anchor": "last_active_at",
    "days": 7
  },
  "expires_at": 1699665376,
  "last_active_at": 1699061776,
  "metadata": {
    "purpose": "testing",
    "created_by": "mcp_server"
  }
}
```

### 2. List Vector Stores
**Endpoint:** `GET /vector_stores`

**Query Parameters:**
- `limit` (optional): Number of objects to return (1-100, default 20)
- `order` (optional): Sort order by created_at timestamp (asc or desc, default desc)
- `after` (optional): Cursor for pagination
- `before` (optional): Cursor for pagination

**Example Request:**
```
GET /vector_stores?limit=10&order=desc
```

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "vs_abc123",
      "object": "vector_store",
      "created_at": 1699061776,
      "name": "My Vector Store",
      "description": null,
      "usage_bytes": 123456,
      "file_counts": {
        "in_progress": 0,
        "completed": 3,
        "failed": 0,
        "cancelled": 0,
        "total": 3
      },
      "status": "completed",
      "expires_after": {
        "anchor": "last_active_at",
        "days": 7
      },
      "expires_at": 1699665376,
      "last_active_at": 1699061776,
      "metadata": {}
    }
  ],
  "first_id": "vs_abc123",
  "last_id": "vs_abc123",
  "has_more": false
}
```

### 3. Get Vector Store
**Endpoint:** `GET /vector_stores/{vector_store_id}`

**Response:**
```json
{
  "id": "vs_abc123",
  "object": "vector_store",
  "created_at": 1699061776,
  "name": "My Vector Store",
  "description": null,
  "usage_bytes": 123456,
  "file_counts": {
    "in_progress": 0,
    "completed": 3,
    "failed": 0,
    "cancelled": 0,
    "total": 3
  },
  "status": "completed",
  "expires_after": {
    "anchor": "last_active_at",
    "days": 7
  },
  "expires_at": 1699665376,
  "last_active_at": 1699061776,
  "metadata": {}
}
```

### 4. Delete Vector Store
**Endpoint:** `DELETE /vector_stores/{vector_store_id}`

**Response:**
```json
{
  "id": "vs_abc123",
  "object": "vector_store.deleted",
  "deleted": true
}
```

## Vector Store File Endpoints

### 1. Add File to Vector Store
**Endpoint:** `POST /vector_stores/{vector_store_id}/files`

**Request Body:**
```json
{
  "file_id": "file-abc123"
}
```

**Response:**
```json
{
  "id": "file-abc123",
  "object": "vector_store.file",
  "created_at": 1699061776,
  "vector_store_id": "vs_abc123",
  "status": "in_progress",
  "last_error": null
}
```

### 2. List Vector Store Files
**Endpoint:** `GET /vector_stores/{vector_store_id}/files`

**Query Parameters:**
- `limit` (optional): Number of objects to return (1-100, default 20)
- `order` (optional): Sort order by created_at timestamp (asc or desc, default desc)
- `after` (optional): Cursor for pagination
- `before` (optional): Cursor for pagination
- `filter` (optional): Filter by file status (in_progress, completed, failed, cancelled)

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "file-abc123",
      "object": "vector_store.file",
      "created_at": 1699061776,
      "vector_store_id": "vs_abc123",
      "status": "completed",
      "last_error": null
    }
  ],
  "first_id": "file-abc123",
  "last_id": "file-abc123",
  "has_more": false
}
```

### 3. Delete Vector Store File
**Endpoint:** `DELETE /vector_stores/{vector_store_id}/files/{file_id}`

**Response:**
```json
{
  "id": "file-abc123",
  "object": "vector_store.file.deleted",
  "deleted": true
}
```

## Error Responses

### Common Error Format
```json
{
  "error": {
    "message": "Invalid API key provided",
    "type": "invalid_request_error",
    "param": null,
    "code": "invalid_api_key"
  }
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid API key)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Common Error Types

#### 1. Authentication Error (401)
```json
{
  "error": {
    "message": "Incorrect API key provided",
    "type": "invalid_request_error",
    "param": null,
    "code": "invalid_api_key"
  }
}
```

#### 2. Rate Limit Error (429)
```json
{
  "error": {
    "message": "Rate limit reached for requests",
    "type": "requests",
    "param": null,
    "code": "rate_limit_exceeded"
  }
}
```

#### 3. Not Found Error (404)
```json
{
  "error": {
    "message": "No such vector store: vs_invalid123",
    "type": "invalid_request_error",
    "param": null,
    "code": "resource_not_found"
  }
}
```

#### 4. Validation Error (400)
```json
{
  "error": {
    "message": "Invalid value for 'name': must be a string",
    "type": "invalid_request_error",
    "param": "name",
    "code": "invalid_value"
  }
}
```

## Implementation Notes

### 1. Request Headers
Always include these headers in requests:
```typescript
{
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
  'User-Agent': 'MCP-Server/2.0.0'
}
```

### 2. Error Handling
```typescript
async function handleOpenAIError(response: Response): Promise<never> {
  const error = await response.json();
  throw new Error(`OpenAI API error: ${error.error.message}`);
}
```

### 3. Rate Limiting
- Implement exponential backoff for 429 errors
- Default rate limits: 500 requests per minute
- Monitor rate limit headers in responses

### 4. Pagination
For list endpoints, handle pagination:
```typescript
// Check if more results available
if (response.has_more) {
  // Use response.last_id for next request
  const nextUrl = `/vector_stores?after=${response.last_id}`;
}
```

### 5. Status Polling
For file operations, poll status until completion:
```typescript
// File statuses: in_progress, completed, failed, cancelled
while (file.status === 'in_progress') {
  await new Promise(resolve => setTimeout(resolve, 1000));
  file = await getVectorStoreFile(vectorStoreId, fileId);
}
```

## TypeScript Types

### Vector Store Types
```typescript
interface VectorStore {
  id: string;
  object: 'vector_store';
  created_at: number;
  name: string;
  description: string | null;
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

interface CreateVectorStoreRequest {
  name: string;
  expires_after?: {
    anchor: 'last_active_at';
    days: number;
  };
  metadata?: Record<string, any>;
}

interface ListVectorStoresResponse {
  object: 'list';
  data: VectorStore[];
  first_id: string;
  last_id: string;
  has_more: boolean;
}
```

### Error Types
```typescript
interface OpenAIError {
  error: {
    message: string;
    type: string;
    param: string | null;
    code: string;
  };
}