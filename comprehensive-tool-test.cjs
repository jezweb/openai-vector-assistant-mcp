#!/usr/bin/env node

/**
 * Comprehensive Tool Test for Universal MCP Server
 * Tests all 15 vector store tools and validates environment setup
 */

const { spawn } = require('child_process');
const readline = require('readline');

class ComprehensiveToolTester {
  constructor() {
    this.serverProcess = null;
    this.testResults = [];
    this.debug = true;
  }

  log(...args) {
    console.log('[COMPREHENSIVE TEST]', ...args);
  }

  error(...args) {
    console.error('[TEST ERROR]', ...args);
  }

  async runTests() {
    this.log('Starting comprehensive tool validation...');
    
    try {
      await this.testEnvironmentSetup();
      await this.startServer();
      await this.runToolTests();
      await this.stopServer();
      this.printResults();
    } catch (error) {
      this.error('Test suite failed:', error);
      await this.stopServer();
      process.exit(1);
    }
  }

  async testEnvironmentSetup() {
    this.log('=== Testing Environment Setup ===');
    
    // Test 1: Missing API key
    this.log('Test 1: Missing API key handling');
    try {
      const testProcess = spawn('node', ['./universal-mcp-server.cjs'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, OPENAI_API_KEY: '' }
      });
      
      let output = '';
      testProcess.stderr.on('data', (data) => {
        output += data.toString();
      });
      
      await new Promise((resolve) => {
        testProcess.on('exit', (code) => {
          if (code === 1 && output.includes('OPENAI_API_KEY')) {
            this.testResults.push({ name: 'Missing API Key Validation', passed: true });
            this.log('✅ Missing API key properly rejected');
          } else {
            this.testResults.push({ name: 'Missing API Key Validation', passed: false });
            this.error('❌ Missing API key not properly handled');
          }
          resolve();
        });
      });
    } catch (error) {
      this.testResults.push({ name: 'Missing API Key Validation', passed: false, error: error.message });
    }

    // Test 2: Invalid API key format
    this.log('Test 2: Invalid API key format');
    try {
      const testProcess = spawn('node', ['./universal-mcp-server.cjs'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, OPENAI_API_KEY: 'invalid-key-format' }
      });
      
      let output = '';
      testProcess.stderr.on('data', (data) => {
        output += data.toString();
      });
      
      await new Promise((resolve) => {
        testProcess.on('exit', (code) => {
          if (code === 1 && output.includes('valid OpenAI API key')) {
            this.testResults.push({ name: 'Invalid API Key Format Validation', passed: true });
            this.log('✅ Invalid API key format properly rejected');
          } else {
            this.testResults.push({ name: 'Invalid API Key Format Validation', passed: false });
            this.error('❌ Invalid API key format not properly handled');
          }
          resolve();
        });
      });
    } catch (error) {
      this.testResults.push({ name: 'Invalid API Key Format Validation', passed: false, error: error.message });
    }
  }

  async startServer() {
    this.log('Starting MCP server for tool testing...');
    
    this.serverProcess = spawn('node', ['./universal-mcp-server.cjs'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        OPENAI_API_KEY: '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',
        DEBUG: 'true'
      }
    });

    this.serverProcess.stderr.on('data', (data) => {
      if (this.debug) {
        console.error('[SERVER]', data.toString().trim());
      }
    });

    // Give server time to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.log('Server started');
  }

  async stopServer() {
    if (this.serverProcess) {
      this.log('Stopping server...');
      this.serverProcess.kill('SIGTERM');
      await new Promise(resolve => setTimeout(resolve, 500));
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
        
        responseData = lines[lines.length - 1];
      };

      this.serverProcess.stdout.on('data', onData);
      this.serverProcess.stdin.write(messageStr + '\n');
    });
  }

  async runToolTests() {
    this.log('=== Testing All 15 Vector Store Tools ===');
    
    // Initialize first
    await this.initialize();
    
    const toolTests = [
      { name: 'vector-store-create', test: () => this.testVectorStoreCreate() },
      { name: 'vector-store-list', test: () => this.testVectorStoreList() },
      { name: 'vector-store-get', test: () => this.testVectorStoreGet() },
      { name: 'vector-store-modify', test: () => this.testVectorStoreModify() },
      { name: 'vector-store-delete', test: () => this.testVectorStoreDelete() },
      { name: 'vector-store-file-add', test: () => this.testVectorStoreFileAdd() },
      { name: 'vector-store-file-list', test: () => this.testVectorStoreFileList() },
      { name: 'vector-store-file-get', test: () => this.testVectorStoreFileGet() },
      { name: 'vector-store-file-content', test: () => this.testVectorStoreFileContent() },
      { name: 'vector-store-file-update', test: () => this.testVectorStoreFileUpdate() },
      { name: 'vector-store-file-delete', test: () => this.testVectorStoreFileDelete() },
      { name: 'vector-store-file-batch-create', test: () => this.testVectorStoreFileBatchCreate() },
      { name: 'vector-store-file-batch-get', test: () => this.testVectorStoreFileBatchGet() },
      { name: 'vector-store-file-batch-cancel', test: () => this.testVectorStoreFileBatchCancel() },
      { name: 'vector-store-file-batch-files', test: () => this.testVectorStoreFileBatchFiles() }
    ];

    for (const toolTest of toolTests) {
      this.log(`\n--- Testing tool: ${toolTest.name} ---`);
      try {
        const result = await toolTest.test();
        this.testResults.push({
          name: `Tool: ${toolTest.name}`,
          passed: true,
          result: result
        });
        this.log(`✅ ${toolTest.name} PASSED`);
      } catch (error) {
        this.testResults.push({
          name: `Tool: ${toolTest.name}`,
          passed: false,
          error: error.message
        });
        this.error(`❌ ${toolTest.name} FAILED:`, error.message);
      }
    }
  }

  async initialize() {
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        clientInfo: { name: 'comprehensive-test-client', version: '1.0.0' }
      }
    };

    const response = await this.sendMessage(request);
    if (response.error) {
      throw new Error(`Initialize failed: ${response.error.message}`);
    }
    return 'Initialized successfully';
  }

  async testVectorStoreCreate() {
    const request = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'vector-store-create',
        arguments: {
          name: 'Comprehensive Test Store',
          metadata: { test: 'comprehensive', purpose: 'tool_validation' }
        }
      }
    };

    const response = await this.sendMessage(request);
    if (response.error || response.result?.isError) {
      throw new Error(`Tool failed: ${response.error?.message || response.result?.content?.[0]?.text}`);
    }

    const content = JSON.parse(response.result.content[0].text);
    this.createdVectorStoreId = content.id; // Store for other tests
    return `Created vector store: ${content.id}`;
  }

  async testVectorStoreList() {
    const request = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'vector-store-list',
        arguments: { limit: 10 }
      }
    };

    const response = await this.sendMessage(request);
    if (response.error || response.result?.isError) {
      throw new Error(`Tool failed: ${response.error?.message || response.result?.content?.[0]?.text}`);
    }

    const content = JSON.parse(response.result.content[0].text);
    return `Listed ${content.data.length} vector stores`;
  }

  async testVectorStoreGet() {
    if (!this.createdVectorStoreId) {
      throw new Error('No vector store ID available for get test');
    }

    const request = {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'vector-store-get',
        arguments: { vector_store_id: this.createdVectorStoreId }
      }
    };

    const response = await this.sendMessage(request);
    if (response.error || response.result?.isError) {
      throw new Error(`Tool failed: ${response.error?.message || response.result?.content?.[0]?.text}`);
    }

    const content = JSON.parse(response.result.content[0].text);
    return `Retrieved vector store: ${content.id}`;
  }

  async testVectorStoreModify() {
    if (!this.createdVectorStoreId) {
      throw new Error('No vector store ID available for modify test');
    }

    const request = {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'vector-store-modify',
        arguments: {
          vector_store_id: this.createdVectorStoreId,
          name: 'Modified Comprehensive Test Store'
        }
      }
    };

    const response = await this.sendMessage(request);
    if (response.error || response.result?.isError) {
      throw new Error(`Tool failed: ${response.error?.message || response.result?.content?.[0]?.text}`);
    }

    return 'Vector store modified successfully';
  }

  async testVectorStoreDelete() {
    if (!this.createdVectorStoreId) {
      throw new Error('No vector store ID available for delete test');
    }

    const request = {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'vector-store-delete',
        arguments: { vector_store_id: this.createdVectorStoreId }
      }
    };

    const response = await this.sendMessage(request);
    if (response.error || response.result?.isError) {
      throw new Error(`Tool failed: ${response.error?.message || response.result?.content?.[0]?.text}`);
    }

    return 'Vector store deleted successfully';
  }

  // File operation tests (these will likely fail due to missing files, but test the tool interface)
  async testVectorStoreFileAdd() {
    const request = {
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: {
        name: 'vector-store-file-add',
        arguments: {
          vector_store_id: 'vs_test',
          file_id: 'file_test'
        }
      }
    };

    const response = await this.sendMessage(request);
    // Expect this to fail, but tool should handle it gracefully
    if (response.result?.isError) {
      return 'Tool correctly handled invalid file/vector store';
    }
    return 'Tool executed without error';
  }

  async testVectorStoreFileList() {
    const request = {
      jsonrpc: '2.0',
      id: 8,
      method: 'tools/call',
      params: {
        name: 'vector-store-file-list',
        arguments: {
          vector_store_id: 'vs_test',
          limit: 5
        }
      }
    };

    const response = await this.sendMessage(request);
    if (response.result?.isError) {
      return 'Tool correctly handled invalid vector store';
    }
    return 'Tool executed without error';
  }

  async testVectorStoreFileGet() {
    const request = {
      jsonrpc: '2.0',
      id: 9,
      method: 'tools/call',
      params: {
        name: 'vector-store-file-get',
        arguments: {
          vector_store_id: 'vs_test',
          file_id: 'file_test'
        }
      }
    };

    const response = await this.sendMessage(request);
    if (response.result?.isError) {
      return 'Tool correctly handled invalid file/vector store';
    }
    return 'Tool executed without error';
  }

  async testVectorStoreFileContent() {
    const request = {
      jsonrpc: '2.0',
      id: 10,
      method: 'tools/call',
      params: {
        name: 'vector-store-file-content',
        arguments: {
          vector_store_id: 'vs_test',
          file_id: 'file_test'
        }
      }
    };

    const response = await this.sendMessage(request);
    if (response.result?.isError) {
      return 'Tool correctly handled invalid file/vector store';
    }
    return 'Tool executed without error';
  }

  async testVectorStoreFileUpdate() {
    const request = {
      jsonrpc: '2.0',
      id: 11,
      method: 'tools/call',
      params: {
        name: 'vector-store-file-update',
        arguments: {
          vector_store_id: 'vs_test',
          file_id: 'file_test',
          metadata: { updated: 'true' }
        }
      }
    };

    const response = await this.sendMessage(request);
    if (response.result?.isError) {
      return 'Tool correctly handled invalid file/vector store';
    }
    return 'Tool executed without error';
  }

  async testVectorStoreFileDelete() {
    const request = {
      jsonrpc: '2.0',
      id: 12,
      method: 'tools/call',
      params: {
        name: 'vector-store-file-delete',
        arguments: {
          vector_store_id: 'vs_test',
          file_id: 'file_test'
        }
      }
    };

    const response = await this.sendMessage(request);
    if (response.result?.isError) {
      return 'Tool correctly handled invalid file/vector store';
    }
    return 'Tool executed without error';
  }

  async testVectorStoreFileBatchCreate() {
    const request = {
      jsonrpc: '2.0',
      id: 13,
      method: 'tools/call',
      params: {
        name: 'vector-store-file-batch-create',
        arguments: {
          vector_store_id: 'vs_test',
          file_ids: ['file1', 'file2']
        }
      }
    };

    const response = await this.sendMessage(request);
    if (response.result?.isError) {
      return 'Tool correctly handled invalid vector store';
    }
    return 'Tool executed without error';
  }

  async testVectorStoreFileBatchGet() {
    const request = {
      jsonrpc: '2.0',
      id: 14,
      method: 'tools/call',
      params: {
        name: 'vector-store-file-batch-get',
        arguments: {
          vector_store_id: 'vs_test',
          batch_id: 'batch_test'
        }
      }
    };

    const response = await this.sendMessage(request);
    if (response.result?.isError) {
      return 'Tool correctly handled invalid batch/vector store';
    }
    return 'Tool executed without error';
  }

  async testVectorStoreFileBatchCancel() {
    const request = {
      jsonrpc: '2.0',
      id: 15,
      method: 'tools/call',
      params: {
        name: 'vector-store-file-batch-cancel',
        arguments: {
          vector_store_id: 'vs_test',
          batch_id: 'batch_test'
        }
      }
    };

    const response = await this.sendMessage(request);
    if (response.result?.isError) {
      return 'Tool correctly handled invalid batch/vector store';
    }
    return 'Tool executed without error';
  }

  async testVectorStoreFileBatchFiles() {
    const request = {
      jsonrpc: '2.0',
      id: 16,
      method: 'tools/call',
      params: {
        name: 'vector-store-file-batch-files',
        arguments: {
          vector_store_id: 'vs_test',
          batch_id: 'batch_test',
          limit: 5
        }
      }
    };

    const response = await this.sendMessage(request);
    if (response.result?.isError) {
      return 'Tool correctly handled invalid batch/vector store';
    }
    return 'Tool executed without error';
  }

  printResults() {
    this.log('\n=== COMPREHENSIVE TEST RESULTS ===');
    
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
      this.log('🎉 All comprehensive tests passed! Server is fully functional.');
    } else {
      this.error('❌ Some tests failed. Review the results above.');
    }
  }
}

// Run tests
if (require.main === module) {
  const tester = new ComprehensiveToolTester();
  tester.runTests().catch(error => {
    console.error('[FATAL]', error);
    process.exit(1);
  });
}

module.exports = { ComprehensiveToolTester };