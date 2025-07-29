#!/usr/bin/env node

/**
 * OpenAI Vector Store MCP Server CLI
 * 
 * This is the executable entry point for the OpenAI Vector Store MCP Server.
 * It can be run directly or via npx.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import and run the main server
async function main() {
  try {
    // Import the main server module
    const { default: serverModule } = await import(join(__dirname, '../dist/index.js'));
    
    // The server should start automatically when imported
  } catch (error) {
    console.error('Failed to start OpenAI Vector Store MCP Server:', error);
    process.exit(1);
  }
}

// Check if OpenAI API key is provided
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is required');
  console.error('');
  console.error('Usage:');
  console.error('  OPENAI_API_KEY=your-api-key npx openai-vector-store-mcp');
  console.error('  or');
  console.error('  export OPENAI_API_KEY=your-api-key');
  console.error('  npx openai-vector-store-mcp');
  process.exit(1);
}

main();