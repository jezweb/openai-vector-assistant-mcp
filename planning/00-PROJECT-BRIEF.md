# MCP Server Project Brief - OpenAI Vector Store

## Mission
Create a clean, modern Model Context Protocol (MCP) server for OpenAI Vector Store API, deployable on Cloudflare Workers.

## Context
- **Date**: July 2025
- **Target**: Replace existing messy implementation with clean architecture
- **Primary Use Case**: AI interface to connect to REST APIs via MCP protocol
- **Deployment**: Cloudflare Workers (edge computing)
- **Authentication**: API key in URL path for simplicity

## What is MCP?
Model Context Protocol (MCP) is a standard that allows AI assistants (like Claude Desktop, Roo) to connect to external tools and data sources. It defines:
- **Tools**: Functions the AI can call
- **Resources**: Data sources the AI can access
- **Transport**: How messages are sent (HTTP, stdio, etc.)

## Why This Project?
1. **Current Implementation Problems**: Existing server is overly complex (1000+ lines, multiple files, proxy layers)
2. **User Need**: Simple way to connect AI assistants to OpenAI Vector Store API
3. **Future Extensibility**: Pattern can be reused for other APIs (Phorest, GitHub, etc.)

## Success Criteria
- ✅ Single Worker file under 500 lines
- ✅ Zero external dependencies beyond TypeScript types
- ✅ Sub-100ms response times
- ✅ Works with Claude Desktop and Roo
- ✅ Easy to extend for new APIs
- ✅ Simple URL-based authentication

## Key Resources
- **MCP Specification**: https://modelcontextprotocol.io/specification/2025-03-26/server
- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **OpenAI Vector Store API**: https://platform.openai.com/docs/api-reference/vector-stores

## Project Files
- `01-REQUIREMENTS.md` - Detailed technical requirements
- `02-ARCHITECTURE.md` - System design and patterns
- `03-API-REFERENCE.md` - OpenAI Vector Store API details
- `04-IMPLEMENTATION-GUIDE.md` - Step-by-step coding instructions
- `05-TESTING-GUIDE.md` - How to test the implementation
- `06-DEPLOYMENT-GUIDE.md` - Cloudflare deployment instructions
- `07-CLIENT-SETUP.md` - How to configure MCP clients
- `08-EXAMPLES/` - Code examples and templates

## Next Steps
1. Read all project files in order
2. Follow the implementation guide
3. Test locally with Wrangler
4. Deploy to Cloudflare Workers
5. Configure MCP client (Claude Desktop/Roo)