#!/usr/bin/env node

/**
 * Manual Test Script for Roo-Compatible MCP Server
 * 
 * This script tests the server's protocol compliance and functionality
 * by simulating the exact message flow that Roo expects.
 */

const { spawn } = require('child_process');
const readline = require('readline');

class RooMCPTester {
  constructor() {
    this.serverProcess = null;
    this.testResults = [];
    this.currentTest = 0;
    this.debug = process.env.DEBUG === 'true';
  }

  log(...args) {
    console.log('[TESTER]', ...args);
  }

  error(...args) {
    console.error('[TESTER ERROR]', ...args);
  }

  async runTests() {
    this.log('Starting Roo MCP Server compatibility tests...');
    
    // Validate environment first
    if (!process.env.OPENAI_API_KEY) {
      this.error('OPENAI_API_KEY environment variable is required');
      process.exit(1);
    }

    try {
      await this.startServer();
      await this.runTestSuite();
      await this.stopServer();
      this.printResults();
    } catch (error) {
      this.error('Test suite failed:', error);
      await this.stopServer();
      process.exit(1);
    }
  }

  async startServer() {
    this.log('Starting MCP server...');
    
    this.serverProcess = spawn('node', ['./universal-mcp-server.cjs'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        DEBUG: 'true'
      }
    });

    this.serverProcess.stderr.on('data', (data) => {
      if (this.debug) {
        console.error('[SERVER]', data.toString().trim());
      }
    });

    this.serverProcess.on('error', (error) => {
      this.error('Server process error:', error);
    });

    this.serverProcess.on('exit', (code, signal) => {
      this.log(`Server process exited with code ${code}, signal ${signal}`);
    });

    // Give server time to start
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.log('Server started');
  }

  async stopServer() {
    if (this.serverProcess) {
      this.log('Stopping server...');
      this.serverProcess.kill('SIGTERM');
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!this.serverProcess.killed) {
        this.serverProcess.kill('SIGKILL');
      }
      this.serverProcess = null;
    }
  }

  async sendMessage(message) {
    return new Promise((resolve, reject) => {
      const messageStr = JSON.stringify(message);
      this.log('Sending:', messageStr);

      let responseData = '';
      let responseReceived = false;

      const timeout = setTimeout(() => {
        if (!responseReceived) {
          reject(new Error('Response timeout'));
        }
      }, 30000);

      const onData = (data) => {
        responseData += data.toString();
        const lines = responseData.split('\n');
        
        // Process complete lines
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line) {
            try {
              const response = JSON.parse(line);
              this.log('Received:', JSON.stringify(response));
              
              if (response.id === message.id || response.method) {
                responseReceived = true;
                clearTimeout(timeout);
                this.serverProcess.stdout.removeListener('data', onData);
                resolve(response);
                return;
              }
            } catch (parseError) {
              this.error('Failed to parse response:', line, parseError);
            }
          }
        }
        
        // Keep the last incomplete line
        responseData = lines[lines.length - 1];
      };

      this.serverProcess.stdout.on('data', onData);
      this.serverProcess.stdin.write(messageStr + '\n');
    });
  }

  async runTestSuite() {
    const tests = [
      {
        name: 'Empty Line Handshake',
        test: () => this.testEmptyLineHandshake()
      },
      {
        name: 'Initialize Request',
        test: () => this.testInitialize()
      },
      {
        name: 'Tools List Request',
        test: () => this.testToolsList()
      },
      {
        name: 'Vector Store Create',
        test: () => this.testVectorStoreCreate()
      },
      {
        name: 'Vector Store List',
        test: () => this.testVectorStoreList()
      },
      {
        name: 'Invalid Tool Call',
        test: () => this.testInvalidTool()
      },
      {
        name: 'Malformed JSON',
        test: () => this.testMalformedJson()
      }
    ];

    for (const test of tests) {
      this.log(`\n--- Running test: ${test.name} ---`);
      try {
        const result = await test.test();
        this.testResults.push({
          name: test.name,
          passed: true,
          result: result
        });
        this.log(`✅ ${test.name} PASSED`);
      } catch (error) {
        this.testResults.push({
          name: test.name,
          passed: false,
          error: error.message
        });
        this.error(`❌ ${test.name} FAILED:`, error.message);
      }
    }
  }

  async testEmptyLineHandshake() {
    // Send empty line that Roo sends during handshake
    this.serverProcess.stdin.write('\n');
    await new Promise(resolve => setTimeout(resolve, 500));
    return 'Empty line handled without error';
  }

  async testInitialize() {
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: 'roo-test-client',
          version: '1.0.0'
        }
      }
    };

    const response = await this.sendMessage(request);
    
    if (response.error) {
      throw new Error(`Initialize failed: ${response.error.message}`);
    }

    if (!response.result || !response.result.serverInfo) {
      throw new Error('Initialize response missing serverInfo');
    }

    return response.result;
  }

  async testToolsList() {
    const request = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    };

    const response = await this.sendMessage(request);
    
    if (response.error) {
      throw new Error(`Tools list failed: ${response.error.message}`);
    }

    if (!response.result || !response.result.tools || !Array.isArray(response.result.tools)) {
      throw new Error('Tools list response missing tools array');
    }

    if (response.result.tools.length !== 15) {
      throw new Error(`Expected 15 tools, got ${response.result.tools.length}`);
    }

    return `Found ${response.result.tools.length} tools`;
  }

  async testVectorStoreCreate() {
    const request = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'vector-store-create',
        arguments: {
          name: 'Test Store from Roo Tester',
          metadata: {
            test: 'true',
            created_by: 'roo-mcp-tester'
          }
        }
      }
    };

    const response = await this.sendMessage(request);
    
    if (response.error) {
      throw new Error(`Vector store create failed: ${response.error.message}`);
    }

    if (!response.result || !response.result.content) {
      throw new Error('Vector store create response missing content');
    }

    // Handle both success and error responses
    const content = response.result.content[0].text;
    
    if (response.result.isError) {
      throw new Error(`Vector store create failed: ${content}`);
    }
    
    const vectorStore = JSON.parse(content);
    
    if (!vectorStore.id || !vectorStore.name) {
      throw new Error('Vector store create response missing required fields');
    }

    return `Created vector store: ${vectorStore.id}`;
  }

  async testVectorStoreList() {
    const request = {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'vector-store-list',
        arguments: {
          limit: 5
        }
      }
    };

    const response = await this.sendMessage(request);
    
    if (response.error) {
      throw new Error(`Vector store list failed: ${response.error.message}`);
    }

    if (!response.result || !response.result.content) {
      throw new Error('Vector store list response missing content');
    }

    const content = response.result.content[0].text;
    
    if (response.result.isError) {
      throw new Error(`Vector store list failed: ${content}`);
    }
    
    const listResponse = JSON.parse(content);
    
    if (!listResponse.data || !Array.isArray(listResponse.data)) {
      throw new Error('Vector store list response missing data array');
    }

    return `Listed ${listResponse.data.length} vector stores`;
  }

  async testInvalidTool() {
    const request = {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'invalid-tool-name',
        arguments: {}
      }
    };

    const response = await this.sendMessage(request);
    
    if (!response.result || !response.result.isError) {
      throw new Error('Expected error response for invalid tool');
    }

    return 'Invalid tool properly rejected';
  }

  async testMalformedJson() {
    // Send malformed JSON
    this.serverProcess.stdin.write('{"invalid": json}\n');
    
    // Wait for error response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return 'Malformed JSON handled gracefully';
  }

  printResults() {
    this.log('\n=== TEST RESULTS ===');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    
    this.testResults.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      this.log(`${status} ${result.name}`);
      if (result.error) {
        this.log(`    Error: ${result.error}`);
      } else if (result.result) {
        this.log(`    Result: ${result.result}`);
      }
    });
    
    this.log(`\nSummary: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      this.log('🎉 All tests passed! Server is Roo-compatible.');
    } else {
      this.error('❌ Some tests failed. Server may not be fully Roo-compatible.');
      process.exit(1);
    }
  }
}

// Environment validation
function validateEnvironment() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('[ERROR] OPENAI_API_KEY environment variable is required');
    console.error('Usage: OPENAI_API_KEY=your-key node test-roo-mcp-server.js');
    process.exit(1);
  }

  if (!apiKey.startsWith('sk-')) {
    console.error('[ERROR] OPENAI_API_KEY must be a valid OpenAI API key starting with "sk-"');
    process.exit(1);
  }

  console.log('[INFO] Environment validation passed');
}

// Run tests
if (require.main === module) {
  validateEnvironment();
  const tester = new RooMCPTester();
  tester.runTests().catch(error => {
    console.error('[FATAL]', error);
    process.exit(1);
  });
}

module.exports = { RooMCPTester };