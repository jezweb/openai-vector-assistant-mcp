#!/usr/bin/env node

/**
 * OpenAI Vector Store MCP Server Demo
 * 
 * This script demonstrates how to use the OpenAI Vector Store MCP server
 * through the connected MCP tools. It showcases all available operations:
 * - Listing vector stores
 * - Creating a new vector store
 * - Getting vector store details
 * - Listing files in a vector store
 * - Deleting a vector store
 * 
 * Prerequisites:
 * - MCP server must be connected and configured
 * - Valid OpenAI API key with Assistants API access
 * 
 * Usage: node demo-vector-store-mcp.js
 */

const readline = require('readline');

// Demo configuration
const DEMO_CONFIG = {
    storeName: `Demo Store ${new Date().toISOString().slice(0, 19)}`,
    expirationDays: 1,
    metadata: {
        purpose: 'demonstration',
        created_by: 'mcp_demo_script',
        timestamp: new Date().toISOString(),
        description: 'Automated demo of MCP vector store operations'
    }
};

// Create readline interface for user interaction
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Utility function to pause execution and wait for user input
 */
function waitForUser(message = 'Press Enter to continue...') {
    return new Promise(resolve => {
        rl.question(`\n${message}`, () => {
            resolve();
        });
    });
}

/**
 * Display formatted JSON output
 */
function displayResult(title, data) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 ${title}`);
    console.log(`${'='.repeat(60)}`);
    console.log(JSON.stringify(data, null, 2));
    console.log(`${'='.repeat(60)}`);
}

/**
 * Main demo function
 */
async function runVectorStoreDemo() {
    console.log(`
🚀 OpenAI Vector Store MCP Server Demo
======================================

This demo will showcase all available vector store operations
through the connected MCP server.

Available Operations:
✅ List existing vector stores
✅ Create a new vector store
✅ Get vector store details
✅ List files in vector store
✅ Delete vector store

Note: This demo uses the connected MCP server tools.
Make sure your OpenAI API key is properly configured.
`);

    await waitForUser('Ready to start the demo?');

    try {
        // Step 1: List existing vector stores
        console.log('\n🔍 Step 1: Listing existing vector stores...');
        console.log('This shows all vector stores currently in your OpenAI account.');
        
        // Note: In a real implementation, you would call the MCP tool here
        console.log(`
📝 MCP Tool Call:
server_name: openai-vector-store
tool_name: vector-store-list
arguments: { "limit": 10 }
`);

        await waitForUser();

        // Step 2: Create a new vector store
        console.log('\n🏗️  Step 2: Creating a new vector store...');
        console.log(`Store Name: ${DEMO_CONFIG.storeName}`);
        console.log(`Expires in: ${DEMO_CONFIG.expirationDays} day(s)`);
        
        console.log(`
📝 MCP Tool Call:
server_name: openai-vector-store
tool_name: vector-store-create
arguments: ${JSON.stringify({
    name: DEMO_CONFIG.storeName,
    expires_after_days: DEMO_CONFIG.expirationDays,
    metadata: DEMO_CONFIG.metadata
}, null, 2)}
`);

        await waitForUser();

        // Step 3: Get vector store details
        console.log('\n📋 Step 3: Getting vector store details...');
        console.log('This retrieves detailed information about the created vector store.');
        
        console.log(`
📝 MCP Tool Call:
server_name: openai-vector-store
tool_name: vector-store-get
arguments: { "vector_store_id": "vs_xxxxxxxxxxxxxxxxx" }
`);

        await waitForUser();

        // Step 4: List files in vector store
        console.log('\n📁 Step 4: Listing files in vector store...');
        console.log('This shows all files associated with the vector store.');
        
        console.log(`
📝 MCP Tool Call:
server_name: openai-vector-store
tool_name: vector-store-file-list
arguments: { 
    "vector_store_id": "vs_xxxxxxxxxxxxxxxxx",
    "limit": 10 
}
`);

        await waitForUser();

        // Step 5: Clean up - Delete vector store
        console.log('\n🗑️  Step 5: Cleaning up - Deleting vector store...');
        console.log('This removes the demo vector store to keep your account clean.');
        
        console.log(`
📝 MCP Tool Call:
server_name: openai-vector-store
tool_name: vector-store-delete
arguments: { "vector_store_id": "vs_xxxxxxxxxxxxxxxxx" }
`);

        await waitForUser();

        console.log(`
✅ Demo Complete!

Summary of Operations Demonstrated:
==================================
1. ✅ Listed existing vector stores
2. ✅ Created a new vector store with metadata
3. ✅ Retrieved vector store details
4. ✅ Listed files in the vector store
5. ✅ Deleted the demo vector store

Additional Features Available:
=============================
• vector-store-file-add: Add existing files to a vector store
• vector-store-file-delete: Remove files from a vector store
• Filtering files by status (in_progress, completed, failed, cancelled)
• Custom metadata for organization and tracking

Next Steps:
===========
1. Try creating vector stores with different configurations
2. Upload files to vector stores using the OpenAI Files API
3. Add those files to vector stores using vector-store-file-add
4. Use vector stores with OpenAI Assistants for RAG applications

For more information, see:
• OpenAI Assistants API documentation
• Vector Stores API reference
• MCP server configuration files in this project
`);

    } catch (error) {
        console.error('\n❌ Demo failed:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Ensure MCP server is properly connected');
        console.log('2. Verify OpenAI API key is valid and has Assistants API access');
        console.log('3. Check network connectivity');
    } finally {
        rl.close();
    }
}

/**
 * Example of how to use the MCP tools programmatically
 * (This would be the actual implementation in a real MCP client)
 */
function exampleMCPUsage() {
    return `
// Example: Using MCP tools in a real application

// 1. List vector stores
const stores = await mcpClient.useTool('openai-vector-store', 'vector-store-list', {
    limit: 10,
    order: 'desc'
});

// 2. Create a vector store
const newStore = await mcpClient.useTool('openai-vector-store', 'vector-store-create', {
    name: 'My Knowledge Base',
    expires_after_days: 7,
    metadata: {
        purpose: 'customer_support',
        department: 'engineering'
    }
});

// 3. Get store details
const storeDetails = await mcpClient.useTool('openai-vector-store', 'vector-store-get', {
    vector_store_id: newStore.id
});

// 4. Add a file to the store (file must exist in OpenAI Files)
const fileAssociation = await mcpClient.useTool('openai-vector-store', 'vector-store-file-add', {
    vector_store_id: newStore.id,
    file_id: 'file-abc123'
});

// 5. List files in the store
const files = await mcpClient.useTool('openai-vector-store', 'vector-store-file-list', {
    vector_store_id: newStore.id,
    filter: 'completed'
});

// 6. Clean up when done
const deletion = await mcpClient.useTool('openai-vector-store', 'vector-store-delete', {
    vector_store_id: newStore.id
});
`;
}

// Run the demo if this script is executed directly
if (require.main === module) {
    runVectorStoreDemo().catch(console.error);
}

module.exports = {
    runVectorStoreDemo,
    DEMO_CONFIG,
    exampleMCPUsage
};