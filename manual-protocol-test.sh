#!/bin/bash

# Manual Protocol Test for Universal MCP Server
# Tests protocol compliance, message formatting, and Roo compatibility

echo "=== Manual Protocol Compliance Test ==="
echo "Testing Universal MCP Server for Roo compatibility"
echo

# Set environment
export OPENAI_API_KEY="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"
export DEBUG=true

# Start server in background
echo "Starting MCP server..."
node universal-mcp-server.cjs > server_output.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Give server time to start
sleep 2

# Function to send message and capture response
send_message() {
    local message="$1"
    local test_name="$2"
    
    echo "--- Test: $test_name ---"
    echo "Sending: $message"
    
    # Send message to server via echo and capture response
    echo "$message" | timeout 10s nc -q 1 localhost 8080 2>/dev/null || {
        # Fallback: send directly to server process
        echo "$message" >&${SERVER_PID}
        sleep 1
    }
    
    echo
}

# Test 1: Empty line handshake (Roo compatibility)
echo "=== Test 1: Empty Line Handshake ==="
echo "" | timeout 5s socat - EXEC:"node universal-mcp-server.cjs",pty 2>/dev/null || echo "Empty line test completed"
echo

# Test 2: Initialize request
echo "=== Test 2: Initialize Request ==="
INIT_MSG='{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"clientInfo":{"name":"manual-test-client","version":"1.0.0"}}}'
echo "$INIT_MSG" | timeout 10s socat - EXEC:"node universal-mcp-server.cjs",pty 2>/dev/null
echo

# Test 3: Tools list request
echo "=== Test 3: Tools List Request ==="
TOOLS_MSG='{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
echo -e "$INIT_MSG\n$TOOLS_MSG" | timeout 10s socat - EXEC:"node universal-mcp-server.cjs",pty 2>/dev/null
echo

# Test 4: Invalid JSON (error handling)
echo "=== Test 4: Invalid JSON Handling ==="
INVALID_MSG='{"invalid": json}'
echo "$INVALID_MSG" | timeout 5s socat - EXEC:"node universal-mcp-server.cjs",pty 2>/dev/null
echo

# Test 5: Missing jsonrpc field
echo "=== Test 5: Missing JSON-RPC Field ==="
MISSING_JSONRPC='{"id":1,"method":"initialize","params":{}}'
echo "$MISSING_JSONRPC" | timeout 5s socat - EXEC:"node universal-mcp-server.cjs",pty 2>/dev/null
echo

# Test 6: Vector store create with proper metadata
echo "=== Test 6: Vector Store Create ==="
CREATE_MSG='{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"vector-store-create","arguments":{"name":"Manual Test Store","metadata":{"test":"manual","created_by":"protocol_test"}}}}'
echo -e "$INIT_MSG\n$CREATE_MSG" | timeout 15s socat - EXEC:"node universal-mcp-server.cjs",pty 2>/dev/null
echo

# Clean up
echo "=== Cleanup ==="
if [ ! -z "$SERVER_PID" ]; then
    kill $SERVER_PID 2>/dev/null
    echo "Server stopped"
fi

echo "=== Manual Protocol Test Complete ==="
echo "Check server_output.log for detailed server logs"