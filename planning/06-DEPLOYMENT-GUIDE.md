# Deployment Guide

## Overview

This guide covers deploying the MCP server to Cloudflare Workers, from initial setup to production configuration and monitoring.

## Prerequisites

### 1. Cloudflare Account
- Sign up at [cloudflare.com](https://cloudflare.com)
- Free tier is sufficient for development and testing
- Paid tier recommended for production (higher limits)

### 2. Required Tools
```bash
# Install Wrangler CLI globally
npm install -g wrangler

# Verify installation
wrangler --version
```

### 3. API Keys
- **OpenAI API Key**: From [platform.openai.com](https://platform.openai.com/api-keys)
- **MCP API Key**: Generate a secure passphrase for MCP authentication

## Initial Setup

### 1. Authenticate with Cloudflare
```bash
# Login to Cloudflare
wrangler login

# This will open a browser window for authentication
# Grant necessary permissions to Wrangler
```

### 2. Verify Account Access
```bash
# List your Cloudflare accounts
wrangler whoami

# Expected output shows your account details
```

### 3. Configure wrangler.toml
Ensure your `wrangler.toml` is properly configured:
```toml
name = "openai-vector-store-mcp"
main = "src/worker.ts"
compatibility_date = "2024-12-06"
compatibility_flags = ["nodejs_compat"]

# Optional: Specify account ID for team accounts
# account_id = "your-account-id-here"

[vars]
MCP_SERVER_NAME = "openai-vector-store-mcp"
MCP_SERVER_VERSION = "2.0.0"

# Development environment
[env.development]
name = "openai-vector-store-mcp-dev"
vars = { ENVIRONMENT = "development" }

# Production environment
[env.production]
name = "openai-vector-store-mcp"
vars = { ENVIRONMENT = "production" }
```

## Development Deployment

### 1. Set Development Secrets
```bash
# Set secrets for development environment
echo "your-openai-api-key" | wrangler secret put OPENAI_API_KEY --env development
echo "your-mcp-api-key" | wrangler secret put MCP_API_KEY --env development
```

### 2. Deploy to Development
```bash
# Deploy to development environment
wrangler deploy --env development

# Expected output:
# ✨ Successfully published your Worker to the following routes:
#   - openai-vector-store-mcp-dev.your-subdomain.workers.dev
```

### 3. Test Development Deployment
```bash
# Test health endpoint
curl https://openai-vector-store-mcp-dev.your-subdomain.workers.dev/

# Test MCP endpoint
curl -X POST https://openai-vector-store-mcp-dev.your-subdomain.workers.dev/mcp/your-mcp-api-key \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {},
    "id": 1
  }'
```

## Production Deployment

### 1. Set Production Secrets
```bash
# Set secrets for production environment
echo "your-production-openai-api-key" | wrangler secret put OPENAI_API_KEY --env production
echo "your-production-mcp-api-key" | wrangler secret put MCP_API_KEY --env production
```

### 2. Deploy to Production
```bash
# Build and deploy to production
npm run build
wrangler deploy --env production

# Expected output:
# ✨ Successfully published your Worker to the following routes:
#   - openai-vector-store-mcp.your-subdomain.workers.dev
```

### 3. Verify Production Deployment
```bash
# Test production endpoint
curl https://openai-vector-store-mcp.your-subdomain.workers.dev/

# Test with production API key
curl -X POST https://openai-vector-store-mcp.your-subdomain.workers.dev/mcp/your-production-mcp-api-key \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

## Custom Domain Setup (Optional)

### 1. Add Custom Domain
```bash
# Add a custom domain to your worker
wrangler custom-domains add api.yourdomain.com --env production
```

### 2. Update DNS
Add a CNAME record in your DNS provider:
```
CNAME api.yourdomain.com openai-vector-store-mcp.your-subdomain.workers.dev
```

### 3. Test Custom Domain
```bash
# Test with custom domain
curl https://api.yourdomain.com/

# Update MCP client configuration to use custom domain
```

## Environment Management

### 1. List Deployments
```bash
# List all deployments
wrangler deployments list

# List deployments for specific environment
wrangler deployments list --env production
```

### 2. Manage Secrets
```bash
# List all secrets
wrangler secret list --env production

# Delete a secret
wrangler secret delete SECRET_NAME --env production

# Update a secret
echo "new-value" | wrangler secret put SECRET_NAME --env production
```

### 3. View Logs
```bash
# Stream real-time logs
wrangler tail --env production

# Filter logs by status
wrangler tail --status error --env production

# Filter logs by method
wrangler tail --method POST --env production
```

## Configuration Management

### 1. Environment Variables
Set non-secret configuration via `wrangler.toml`:
```toml
[env.production.vars]
ENVIRONMENT = "production"
MCP_SERVER_NAME = "openai-vector-store-mcp"
MCP_SERVER_VERSION = "2.0.0"
OPENAI_API_BASE_URL = "https://api.openai.com/v1"
```

### 2. Feature Flags
Add feature flags for gradual rollouts:
```toml
[env.production.vars]
ENABLE_FILE_OPERATIONS = "true"
ENABLE_BATCH_OPERATIONS = "false"
ENABLE_DEBUG_LOGGING = "false"
```

### 3. Rate Limiting Configuration
Configure rate limiting if needed:
```toml
[env.production.vars]
MAX_REQUESTS_PER_MINUTE = "100"
ENABLE_RATE_LIMITING = "true"
```

## Monitoring and Analytics

### 1. Cloudflare Analytics
Access built-in analytics:
- Go to Cloudflare Dashboard
- Navigate to Workers & Pages
- Select your worker
- View Analytics tab

Key metrics to monitor:
- Request volume
- Response time (P50, P95, P99)
- Error rate
- Geographic distribution

### 2. Custom Logging
Add structured logging to your worker:
```typescript
// In worker.ts
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  method: request.method,
  url: request.url,
  userAgent: request.headers.get('User-Agent'),
  responseTime: Date.now() - startTime,
  status: response.status
}));
```

### 3. Error Tracking
Implement error tracking:
```typescript
// In worker.ts error handler
console.error(JSON.stringify({
  timestamp: new Date().toISOString(),
  error: error.message,
  stack: error.stack,
  request: {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers)
  }
}));
```

## Security Configuration

### 1. API Key Security
- Use strong, unique API keys
- Rotate keys regularly
- Never log API keys
- Use different keys for dev/prod

### 2. CORS Configuration
Configure CORS appropriately:
```typescript
// Restrictive CORS for production
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};
```

### 3. Rate Limiting
Implement rate limiting if needed:
```typescript
// Basic rate limiting example
const rateLimitKey = `rate_limit:${clientIP}`;
const requests = await env.KV.get(rateLimitKey);
if (requests && parseInt(requests) > 100) {
  return new Response('Rate limit exceeded', { status: 429 });
}
```

## Performance Optimization

### 1. Bundle Size Optimization
- Keep dependencies minimal
- Use tree shaking
- Avoid large libraries

### 2. Cold Start Optimization
- Minimize initialization code
- Use lazy loading where possible
- Cache expensive operations

### 3. Response Optimization
- Use appropriate HTTP status codes
- Implement proper caching headers
- Compress responses when beneficial

## Backup and Recovery

### 1. Configuration Backup
```bash
# Export current configuration
wrangler secret list --env production > secrets-backup.txt
cp wrangler.toml wrangler.toml.backup
```

### 2. Rollback Strategy
```bash
# Rollback to previous deployment
wrangler rollback --env production

# Deploy specific version
wrangler deploy --env production --compatibility-date 2024-11-01
```

### 3. Disaster Recovery
- Keep configuration in version control
- Document all secrets and their sources
- Maintain deployment runbooks
- Test recovery procedures regularly

## Scaling Considerations

### 1. Cloudflare Workers Limits
**Free Tier:**
- 100,000 requests/day
- 10ms CPU time per request
- 128MB memory

**Paid Tier:**
- Unlimited requests
- 50ms CPU time per request (can be increased)
- 128MB memory

### 2. OpenAI API Limits
- Monitor rate limits
- Implement exponential backoff
- Consider request queuing for high volume

### 3. Geographic Distribution
Cloudflare Workers automatically distribute globally:
- No additional configuration needed
- Monitor regional performance
- Consider data locality requirements

## Troubleshooting

### 1. Deployment Issues
```bash
# Check deployment status
wrangler deployments list --env production

# View detailed logs
wrangler tail --env production

# Test locally first
wrangler dev --env production --local
```

### 2. Runtime Issues
```bash
# Check worker logs
wrangler tail --env production --format pretty

# Test specific endpoints
curl -v https://your-worker.workers.dev/health

# Validate configuration
wrangler secret list --env production
```

### 3. Performance Issues
- Monitor Cloudflare Analytics
- Check OpenAI API response times
- Review worker CPU usage
- Optimize code paths

## Maintenance

### 1. Regular Updates
- Update dependencies monthly
- Monitor security advisories
- Test updates in development first
- Plan maintenance windows

### 2. Secret Rotation
```bash
# Rotate API keys quarterly
echo "new-openai-api-key" | wrangler secret put OPENAI_API_KEY --env production
echo "new-mcp-api-key" | wrangler secret put MCP_API_KEY --env production

# Update client configurations
# Test thoroughly before completing rotation
```

### 3. Monitoring Health
- Set up uptime monitoring
- Monitor error rates
- Track performance metrics
- Review logs regularly

This deployment guide ensures your MCP server runs reliably in production with proper monitoring, security, and maintenance procedures.