#!/usr/bin/env node

/**
 * MCP Client Test Script for Roo Integration
 * Tests the OpenAI Vector Store MCP server using the actual MCP SDK
 * Simulates how Roo client would interact with the server
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

// Configuration from roo-config.json
const SERVER_URL = 'https://vectorstore.jezweb.com/mcp/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';

class MCPTestSuite {
  constructor() {
    this.client = null;
    this.transport = null;
    this.testResults = {
      connectivity: null,
      initialization: null,
      toolsList: null,
      vectorStoreList: null,
      vectorStoreCreate: null,
      vectorStoreGet: null,
      vectorStoreDelete: null,
      errorHandling: null,
      performance: null
    };
    this.createdVectorStoreId = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testConnectivity() {
    this.log('Testing MCP server connectivity...', 'info');
    try {
      // Test basic HTTP connectivity first
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'ping',
          params: {}
        })
      });

      if (response.ok) {
        this.testResults.connectivity = { success: true, responseTime: Date.now() };
        this.log('Server connectivity test passed', 'success');
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      this.testResults.connectivity = { success: false, error: error.message };
      this.log(`Connectivity test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testInitialization() {
    this.log('Testing MCP client initialization...', 'info');
    try {
      // Create transport and client
      this.transport = new SSEClientTransport(new URL(SERVER_URL));
      this.client = new Client({
        name: 'roo-test-client',
        version: '1.0.0'
      }, {
        capabilities: {
          tools: {}
        }
      });

      // Connect to server
      await this.client.connect(this.transport);
      
      this.testResults.initialization = { success: true };
      this.log('MCP client initialization successful', 'success');
      return true;
    } catch (error) {
      this.testResults.initialization = { success: false, error: error.message };
      this.log(`Initialization failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testToolsList() {
    this.log('Testing tools/list functionality...', 'info');
    try {
      const result = await this.client.listTools();
      
      const expectedTools = [
        'vector-store-create',
        'vector-store-list', 
        'vector-store-get',
        'vector-store-delete'
      ];

      const availableTools = result.tools.map(tool => tool.name);
      const missingTools = expectedTools.filter(tool => !availableTools.includes(tool));
      
      if (missingTools.length === 0) {
        this.testResults.toolsList = { 
          success: true, 
          tools: availableTools,
          count: availableTools.length 
        };
        this.log(`Tools list test passed. Found ${availableTools.length} tools: ${availableTools.join(', ')}`, 'success');
        return true;
      } else {
        throw new Error(`Missing expected tools: ${missingTools.join(', ')}`);
      }
    } catch (error) {
      this.testResults.toolsList = { success: false, error: error.message };
      this.log(`Tools list test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testVectorStoreList() {
    this.log('Testing vector-store-list tool...', 'info');
    try {
      const startTime = Date.now();
      const result = await this.client.callTool('vector-store-list', {
        limit: 10
      });
      const responseTime = Date.now() - startTime;

      if (result.content && Array.isArray(result.content)) {
        this.testResults.vectorStoreList = { 
          success: true, 
          responseTime,
          vectorStoreCount: result.content.length 
        };
        this.log(`Vector store list test passed. Found ${result.content.length} vector stores (${responseTime}ms)`, 'success');
        return true;
      } else {
        throw new Error('Invalid response format from vector-store-list');
      }
    } catch (error) {
      this.testResults.vectorStoreList = { success: false, error: error.message };
      this.log(`Vector store list test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testVectorStoreCreate() {
    this.log('Testing vector-store-create tool...', 'info');
    try {
      const startTime = Date.now();
      const testStoreName = `Roo-Test-Store-${Date.now()}`;
      
      const result = await this.client.callTool('vector-store-create', {
        name: testStoreName,
        expires_after_days: 1,
        metadata: {
          purpose: 'roo_integration_testing',
          created_by: 'mcp_test_suite',
          test_timestamp: new Date().toISOString()
        }
      });
      const responseTime = Date.now() - startTime;

      if (result.content && result.content[0] && result.content[0].text) {
        const response = JSON.parse(result.content[0].text);
        if (response.id) {
          this.createdVectorStoreId = response.id;
          this.testResults.vectorStoreCreate = { 
            success: true, 
            responseTime,
            vectorStoreId: response.id,
            name: testStoreName
          };
          this.log(`Vector store create test passed. Created store: ${response.id} (${responseTime}ms)`, 'success');
          return true;
        }
      }
      throw new Error('Invalid response format from vector-store-create');
    } catch (error) {
      this.testResults.vectorStoreCreate = { success: false, error: error.message };
      this.log(`Vector store create test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testVectorStoreGet() {
    this.log('Testing vector-store-get tool...', 'info');
    if (!this.createdVectorStoreId) {
      this.log('Skipping vector-store-get test - no vector store created', 'warning');
      this.testResults.vectorStoreGet = { success: false, error: 'No vector store ID available' };
      return false;
    }

    try {
      const startTime = Date.now();
      const result = await this.client.callTool('vector-store-get', {
        vector_store_id: this.createdVectorStoreId
      });
      const responseTime = Date.now() - startTime;

      if (result.content && result.content[0] && result.content[0].text) {
        const response = JSON.parse(result.content[0].text);
        if (response.id === this.createdVectorStoreId) {
          this.testResults.vectorStoreGet = { 
            success: true, 
            responseTime,
            vectorStoreId: response.id,
            status: response.status
          };
          this.log(`Vector store get test passed. Retrieved store: ${response.id} (${responseTime}ms)`, 'success');
          return true;
        }
      }
      throw new Error('Invalid response format from vector-store-get');
    } catch (error) {
      this.testResults.vectorStoreGet = { success: false, error: error.message };
      this.log(`Vector store get test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testVectorStoreDelete() {
    this.log('Testing vector-store-delete tool...', 'info');
    if (!this.createdVectorStoreId) {
      this.log('Skipping vector-store-delete test - no vector store created', 'warning');
      this.testResults.vectorStoreDelete = { success: false, error: 'No vector store ID available' };
      return false;
    }

    try {
      const startTime = Date.now();
      const result = await this.client.callTool('vector-store-delete', {
        vector_store_id: this.createdVectorStoreId
      });
      const responseTime = Date.now() - startTime;

      if (result.content && result.content[0] && result.content[0].text) {
        const response = JSON.parse(result.content[0].text);
        if (response.deleted === true) {
          this.testResults.vectorStoreDelete = { 
            success: true, 
            responseTime,
            vectorStoreId: this.createdVectorStoreId
          };
          this.log(`Vector store delete test passed. Deleted store: ${this.createdVectorStoreId} (${responseTime}ms)`, 'success');
          return true;
        }
      }
      throw new Error('Invalid response format from vector-store-delete');
    } catch (error) {
      this.testResults.vectorStoreDelete = { success: false, error: error.message };
      this.log(`Vector store delete test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testErrorHandling() {
    this.log('Testing error handling scenarios...', 'info');
    const errorTests = [];

    try {
      // Test 1: Invalid tool name
      try {
        await this.client.callTool('invalid-tool-name', {});
        errorTests.push({ test: 'invalid_tool', success: false, error: 'Should have thrown error' });
      } catch (error) {
        errorTests.push({ test: 'invalid_tool', success: true, error: error.message });
      }

      // Test 2: Missing required parameters
      try {
        await this.client.callTool('vector-store-get', {});
        errorTests.push({ test: 'missing_params', success: false, error: 'Should have thrown error' });
      } catch (error) {
        errorTests.push({ test: 'missing_params', success: true, error: error.message });
      }

      // Test 3: Invalid vector store ID
      try {
        await this.client.callTool('vector-store-get', { vector_store_id: 'invalid-id' });
        errorTests.push({ test: 'invalid_id', success: false, error: 'Should have thrown error' });
      } catch (error) {
        errorTests.push({ test: 'invalid_id', success: true, error: error.message });
      }

      const successfulErrorTests = errorTests.filter(test => test.success).length;
      this.testResults.errorHandling = { 
        success: successfulErrorTests === errorTests.length, 
        tests: errorTests,
        passedCount: successfulErrorTests,
        totalCount: errorTests.length
      };
      
      this.log(`Error handling test completed. ${successfulErrorTests}/${errorTests.length} tests passed`, 
        successfulErrorTests === errorTests.length ? 'success' : 'warning');
      return successfulErrorTests === errorTests.length;
    } catch (error) {
      this.testResults.errorHandling = { success: false, error: error.message };
      this.log(`Error handling test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testPerformance() {
    this.log('Testing performance and reliability...', 'info');
    try {
      const performanceTests = [];
      const concurrentRequests = 3;
      
      // Test concurrent requests
      const promises = [];
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(this.measurePerformance(async () => {
          return await this.client.callTool('vector-store-list', { limit: 5 });
        }));
      }

      const results = await Promise.all(promises);
      const avgResponseTime = results.reduce((sum, result) => sum + result.time, 0) / results.length;
      const allSuccessful = results.every(result => result.success);

      this.testResults.performance = {
        success: allSuccessful,
        concurrentRequests,
        averageResponseTime: avgResponseTime,
        results: results
      };

      this.log(`Performance test completed. Avg response time: ${avgResponseTime.toFixed(2)}ms`, 
        allSuccessful ? 'success' : 'warning');
      return allSuccessful;
    } catch (error) {
      this.testResults.performance = { success: false, error: error.message };
      this.log(`Performance test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async measurePerformance(testFunction) {
    const startTime = Date.now();
    try {
      const result = await testFunction();
      return {
        success: true,
        time: Date.now() - startTime,
        result: result
      };
    } catch (error) {
      return {
        success: false,
        time: Date.now() - startTime,
        error: error.message
      };
    }
  }

  async cleanup() {
    this.log('Cleaning up test resources...', 'info');
    try {
      if (this.client) {
        await this.client.close();
      }
      if (this.transport) {
        await this.transport.close();
      }
      this.log('Cleanup completed', 'success');
    } catch (error) {
      this.log(`Cleanup failed: ${error.message}`, 'warning');
    }
  }

  generateReport() {
    this.log('\n' + '='.repeat(80), 'info');
    this.log('MCP SERVER INTEGRATION TEST REPORT', 'info');
    this.log('='.repeat(80), 'info');
    
    const tests = [
      { name: 'Connectivity', result: this.testResults.connectivity },
      { name: 'Initialization', result: this.testResults.initialization },
      { name: 'Tools List', result: this.testResults.toolsList },
      { name: 'Vector Store List', result: this.testResults.vectorStoreList },
      { name: 'Vector Store Create', result: this.testResults.vectorStoreCreate },
      { name: 'Vector Store Get', result: this.testResults.vectorStoreGet },
      { name: 'Vector Store Delete', result: this.testResults.vectorStoreDelete },
      { name: 'Error Handling', result: this.testResults.errorHandling },
      { name: 'Performance', result: this.testResults.performance }
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    tests.forEach(test => {
      const status = test.result?.success ? '✅ PASS' : '❌ FAIL';
      const details = test.result?.success ? 
        (test.result.responseTime ? ` (${test.result.responseTime}ms)` : '') :
        ` - ${test.result?.error || 'Unknown error'}`;
      
      this.log(`${status} ${test.name}${details}`, test.result?.success ? 'success' : 'error');
      
      if (test.result?.success) passedTests++;
    });

    this.log('\n' + '-'.repeat(80), 'info');
    this.log(`SUMMARY: ${passedTests}/${totalTests} tests passed`, 
      passedTests === totalTests ? 'success' : 'warning');
    
    if (passedTests === totalTests) {
      this.log('🎉 ALL TESTS PASSED - MCP server is fully functional with Roo client!', 'success');
    } else {
      this.log('⚠️  Some tests failed - please review the issues above', 'warning');
    }

    this.log('='.repeat(80), 'info');

    return {
      passed: passedTests,
      total: totalTests,
      success: passedTests === totalTests,
      results: this.testResults
    };
  }

  async runAllTests() {
    this.log('Starting comprehensive MCP server test suite...', 'info');
    this.log(`Server URL: ${SERVER_URL}`, 'info');
    this.log(`Test started at: ${new Date().toISOString()}`, 'info');
    
    try {
      // Run tests in sequence
      await this.testConnectivity();
      await this.sleep(1000);
      
      await this.testInitialization();
      await this.sleep(1000);
      
      await this.testToolsList();
      await this.sleep(1000);
      
      await this.testVectorStoreList();
      await this.sleep(1000);
      
      await this.testVectorStoreCreate();
      await this.sleep(2000); // Give time for vector store to be created
      
      await this.testVectorStoreGet();
      await this.sleep(1000);
      
      await this.testVectorStoreDelete();
      await this.sleep(1000);
      
      await this.testErrorHandling();
      await this.sleep(1000);
      
      await this.testPerformance();
      
    } catch (error) {
      this.log(`Test suite failed with unexpected error: ${error.message}`, 'error');
    } finally {
      await this.cleanup();
      return this.generateReport();
    }
  }
}

// Run the test suite
async function main() {
  const testSuite = new MCPTestSuite();
  const report = await testSuite.runAllTests();
  
  // Exit with appropriate code
  process.exit(report.success ? 0 : 1);
}

// Run the test suite if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Test suite crashed:', error);
    process.exit(1);
  });
}

export default MCPTestSuite;