#!/usr/bin/env node

/**
 * Test script for Phase 2 Universal MCP Server v1.2.0
 * Tests tool registration and new file management tools
 */

const { spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs');

// Load .env file for testing (TESTING ONLY - NOT FOR PRODUCTION)
function loadEnv() {
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    });
    console.log('🔑 Loaded API key from .env for testing');
  } catch (error) {
    console.log('⚠️  No .env file found, using environment variables');
  }
}

class MCPServerTester {
  constructor() {
    this.requestId = 1;
    this.responses = [];
  }

  async testServer() {
    console.log('🧪 Testing Universal MCP Server v1.2.0 Phase 2 Implementation');
    console.log('=' .repeat(70));

    // Load environment variables for testing
    loadEnv();

    // Start the server
    const server = spawn('node', ['universal-mcp-server.cjs'], {
      env: { ...process.env, DEBUG: 'false' },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let serverOutput = '';
    server.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        try {
          const response = JSON.parse(line);
          this.responses.push(response);
          console.log('📥 Server Response:', JSON.stringify(response, null, 2));
        } catch (e) {
          console.log('📥 Raw Output:', line);
        }
      });
    });

    server.stderr.on('data', (data) => {
      console.log('🔍 Server Debug:', data.toString().trim());
    });

    // Test 1: Initialize
    console.log('\n🔧 Test 1: Server Initialization');
    const initRequest = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    };
    
    server.stdin.write(JSON.stringify(initRequest) + '\n');
    
    // Wait for initialization
    await this.sleep(2000);

    // Test 2: List Tools
    console.log('\n📋 Test 2: List All Tools (Should be 21 tools)');
    const toolsRequest = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'tools/list',
      params: {}
    };
    
    server.stdin.write(JSON.stringify(toolsRequest) + '\n');
    
    // Wait for tools list
    await this.sleep(2000);

    // Analyze results
    this.analyzeResults();

    // Cleanup
    server.kill('SIGTERM');
    
    return this.responses;
  }

  analyzeResults() {
    console.log('\n📊 Analysis Results:');
    console.log('=' .repeat(50));

    const toolsResponse = this.responses.find(r => r.result && r.result.tools);
    
    if (toolsResponse) {
      const tools = toolsResponse.result.tools;
      console.log(`✅ Total Tools Found: ${tools.length}`);
      
      // Check for new file management tools
      const fileTools = tools.filter(t => t.name.startsWith('file-') || t.name.startsWith('upload-'));
      console.log(`✅ File Management Tools: ${fileTools.length}`);
      
      const expectedFileTools = [
        'file-upload',
        'file-list', 
        'file-get',
        'file-delete',
        'file-content',
        'upload-create'
      ];
      
      console.log('\n🔍 File Management Tools Check:');
      expectedFileTools.forEach(toolName => {
        const found = tools.find(t => t.name === toolName);
        if (found) {
          console.log(`  ✅ ${toolName} - ${found.description.substring(0, 60)}...`);
        } else {
          console.log(`  ❌ ${toolName} - MISSING`);
        }
      });

      // Check vector store tools
      const vectorTools = tools.filter(t => t.name.startsWith('vector-store-'));
      console.log(`\n✅ Vector Store Tools: ${vectorTools.length}`);
      
      // Version check
      const initResponse = this.responses.find(r => r.result && r.result.serverInfo);
      if (initResponse) {
        const version = initResponse.result.serverInfo.version;
        console.log(`✅ Server Version: ${version}`);
        if (version === '1.2.0') {
          console.log('✅ Version 1.2.0 confirmed!');
        } else {
          console.log('❌ Expected version 1.2.0');
        }
      }

      // Summary
      console.log('\n📈 Summary:');
      if (tools.length === 21 && fileTools.length === 6) {
        console.log('🎉 SUCCESS: Phase 2 implementation complete!');
        console.log('   - 21 total tools (15 existing + 6 new file tools)');
        console.log('   - All file management tools present');
        console.log('   - Server starts and responds correctly');
      } else {
        console.log('⚠️  Issues detected:');
        console.log(`   - Expected 21 tools, found ${tools.length}`);
        console.log(`   - Expected 6 file tools, found ${fileTools.length}`);
      }
    } else {
      console.log('❌ No tools response received');
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the test
const tester = new MCPServerTester();
tester.testServer().catch(console.error);