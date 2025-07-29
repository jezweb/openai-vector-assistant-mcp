# OpenAI Vector Store MCP Server Usage Guide

This guide demonstrates how to effectively use the OpenAI Vector Store MCP server that's connected to this environment.

## 🚀 Quick Start

The OpenAI Vector Store MCP server provides seamless integration with OpenAI's Vector Stores API through the Model Context Protocol (MCP). This allows you to manage vector stores directly from your MCP-enabled applications.

### Available Tools

| Tool Name | Description | Use Case |
|-----------|-------------|----------|
| `vector-store-list` | List all vector stores | Browse existing stores |
| `vector-store-create` | Create a new vector store | Set up knowledge bases |
| `vector-store-get` | Get details of a specific store | Inspect store properties |
| `vector-store-delete` | Delete a vector store | Clean up unused stores |
| `vector-store-file-list` | List files in a store | Manage store contents |
| `vector-store-file-add` | Add file to a store | Build knowledge base |
| `vector-store-file-delete` | Remove file from store | Update knowledge base |

## 📋 Demonstrated Operations

### 1. List Vector Stores
```javascript
// MCP Tool Call
server_name: "openai-vector-store"
tool_name: "vector-store-list"
arguments: {
  "limit": 10,
  "order": "desc"  // Optional: "asc" or "desc"
}
```

**Example Response:**
```json
[
  {
    "id": "vs_6888dad12f088191aabe8ecad0ee3625",
    "object": "vector_store",
    "created_at": 1753799377,
    "name": "Fixed MCP Server Test Store",
    "status": "completed",
    "file_counts": {
      "total": 0,
      "completed": 0,
      "in_progress": 0,
      "failed": 0,
      "cancelled": 0
    },
    "expires_after": {
      "anchor": "last_active_at",
      "days": 3
    },
    "metadata": {
      "purpose": "testing_fixed_mcp_connection",
      "created_by": "roo_assistant"
    }
  }
]
```

### 2. Create Vector Store
```javascript
// MCP Tool Call
server_name: "openai-vector-store"
tool_name: "vector-store-create"
arguments: {
  "name": "My Knowledge Base",
  "expires_after_days": 7,  // Optional
  "metadata": {             // Optional
    "purpose": "customer_support",
    "department": "engineering",
    "created_by": "demo_script"
  }
}
```

**Example Response:**
```json
{
  "id": "vs_6888ec54539c8191842d807f4f556cd0",
  "object": "vector_store",
  "created_at": 1753803860,
  "name": "My Knowledge Base",
  "status": "completed",
  "expires_after": {
    "anchor": "last_active_at",
    "days": 7
  },
  "metadata": {
    "purpose": "customer_support",
    "department": "engineering",
    "created_by": "demo_script"
  }
}
```

### 3. Get Vector Store Details
```javascript
// MCP Tool Call
server_name: "openai-vector-store"
tool_name: "vector-store-get"
arguments: {
  "vector_store_id": "vs_6888ec54539c8191842d807f4f556cd0"
}
```

### 4. List Files in Vector Store
```javascript
// MCP Tool Call
server_name: "openai-vector-store"
tool_name: "vector-store-file-list"
arguments: {
  "vector_store_id": "vs_6888ec54539c8191842d807f4f556cd0",
  "limit": 20,              // Optional, default: 20
  "filter": "completed"     // Optional: "in_progress", "completed", "failed", "cancelled"
}
```

### 5. Add File to Vector Store
```javascript
// MCP Tool Call
server_name: "openai-vector-store"
tool_name: "vector-store-file-add"
arguments: {
  "vector_store_id": "vs_6888ec54539c8191842d807f4f556cd0",
  "file_id": "file-abc123xyz"  // Must be an existing OpenAI file ID
}
```

### 6. Delete Vector Store
```javascript
// MCP Tool Call
server_name: "openai-vector-store"
tool_name: "vector-store-delete"
arguments: {
  "vector_store_id": "vs_6888ec54539c8191842d807f4f556cd0"
}
```

**Example Response:**
```json
{
  "id": "vs_6888ec54539c8191842d807f4f556cd0",
  "object": "vector_store.deleted",
  "deleted": true
}
```

## 🎯 Practical Use Cases

### 1. Knowledge Base Management
```javascript
// Create a knowledge base for customer support
const supportKB = await mcpClient.useTool('openai-vector-store', 'vector-store-create', {
  name: 'Customer Support KB',
  expires_after_days: 30,
  metadata: {
    purpose: 'customer_support',
    department: 'support',
    version: '1.0'
  }
});

// Add documentation files
await mcpClient.useTool('openai-vector-store', 'vector-store-file-add', {
  vector_store_id: supportKB.id,
  file_id: 'file-faq-docs'
});
```

### 2. Temporary Research Collections
```javascript
// Create a temporary store for research
const researchStore = await mcpClient.useTool('openai-vector-store', 'vector-store-create', {
  name: 'Research Project Alpha',
  expires_after_days: 1,  // Auto-cleanup after 1 day
  metadata: {
    purpose: 'research',
    project: 'alpha',
    temporary: true
  }
});
```

### 3. Content Organization
```javascript
// List stores by purpose
const allStores = await mcpClient.useTool('openai-vector-store', 'vector-store-list', {
  limit: 50
});

const supportStores = allStores.filter(store => 
  store.metadata?.purpose === 'customer_support'
);
```

## 🔧 Best Practices

### 1. Naming Conventions
- Use descriptive names: `"Customer Support KB v2.1"`
- Include version numbers for evolving knowledge bases
- Add timestamps for temporary stores: `"Research Data 2024-01-15"`

### 2. Metadata Usage
```javascript
{
  "purpose": "customer_support",     // Primary use case
  "department": "engineering",       // Owning team
  "version": "1.2",                 // Version tracking
  "created_by": "automation_script", // Creation source
  "project": "project_alpha",       // Associated project
  "environment": "production"       // Environment indicator
}
```

### 3. Expiration Management
- Set appropriate expiration times based on use case
- Use short expiration (1-7 days) for temporary/test stores
- Use longer expiration (30+ days) for production knowledge bases
- Monitor and clean up expired stores regularly

### 4. File Management
```javascript
// Check file status before adding
const files = await mcpClient.useTool('openai-vector-store', 'vector-store-file-list', {
  vector_store_id: storeId,
  filter: 'failed'
});

// Remove failed files and re-add
for (const file of files) {
  await mcpClient.useTool('openai-vector-store', 'vector-store-file-delete', {
    vector_store_id: storeId,
    file_id: file.id
  });
}
```

## 🚨 Error Handling

### Common Error Scenarios
1. **Invalid Vector Store ID**: Store doesn't exist or was deleted
2. **File Not Found**: File ID doesn't exist in OpenAI Files
3. **Permission Issues**: API key lacks Assistants API access
4. **Rate Limits**: Too many requests in short time

### Error Handling Pattern
```javascript
try {
  const result = await mcpClient.useTool('openai-vector-store', 'vector-store-get', {
    vector_store_id: 'vs_invalid_id'
  });
} catch (error) {
  if (error.code === 'not_found') {
    console.log('Vector store not found');
  } else if (error.code === 'rate_limit_exceeded') {
    console.log('Rate limit exceeded, retrying...');
    // Implement retry logic
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## 📊 Monitoring and Analytics

### Store Usage Tracking
```javascript
// Get detailed store information
const store = await mcpClient.useTool('openai-vector-store', 'vector-store-get', {
  vector_store_id: storeId
});

console.log(`Store: ${store.name}`);
console.log(`Files: ${store.file_counts.total}`);
console.log(`Size: ${store.usage_bytes} bytes`);
console.log(`Last Active: ${new Date(store.last_active_at * 1000)}`);
```

### Cleanup Automation
```javascript
// Find stores expiring soon
const stores = await mcpClient.useTool('openai-vector-store', 'vector-store-list', {
  limit: 100
});

const expiringSoon = stores.filter(store => {
  if (!store.expires_at) return false;
  const expiryDate = new Date(store.expires_at * 1000);
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  return expiryDate < threeDaysFromNow;
});

console.log(`${expiringSoon.length} stores expiring in the next 3 days`);
```

## 🔗 Integration with OpenAI Assistants

Vector stores are designed to work with OpenAI Assistants for Retrieval-Augmented Generation (RAG):

```javascript
// 1. Create and populate vector store
const knowledgeBase = await mcpClient.useTool('openai-vector-store', 'vector-store-create', {
  name: 'Product Documentation',
  metadata: { purpose: 'assistant_rag' }
});

// 2. Add files to the store
await mcpClient.useTool('openai-vector-store', 'vector-store-file-add', {
  vector_store_id: knowledgeBase.id,
  file_id: 'file-product-docs'
});

// 3. Use with OpenAI Assistant (via OpenAI API, not MCP)
// const assistant = await openai.beta.assistants.create({
//   name: "Product Support Assistant",
//   tools: [{"type": "file_search"}],
//   tool_resources: {
//     "file_search": {
//       "vector_store_ids": [knowledgeBase.id]
//     }
//   }
// });
```

## 📁 Demo Files

- [`demo-vector-store-mcp.js`](./demo-vector-store-mcp.js) - Interactive demo script
- [`test-mcp-client.js`](./test-mcp-client.js) - Basic MCP client test
- [`test-mcp-http-client.js`](./test-mcp-http-client.js) - HTTP-based MCP client

## 🔧 Configuration Files

- [`claude-desktop-config.json`](./claude-desktop-config.json) - Claude Desktop MCP config
- [`roo-config.json`](./roo-config.json) - Roo MCP configuration
- [`CLIENT-SETUP-GUIDE.md`](./CLIENT-SETUP-GUIDE.md) - Detailed setup instructions

## 📚 Additional Resources

- [OpenAI Assistants API Documentation](https://platform.openai.com/docs/assistants/overview)
- [Vector Stores API Reference](https://platform.openai.com/docs/api-reference/vector-stores)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [MCP Server Implementation](./src/) - Source code for this MCP server

---

*This MCP server is deployed on Cloudflare Workers and provides production-ready access to OpenAI's Vector Stores API through the Model Context Protocol.*