import { NextRequest, NextResponse } from "next/server";
import { authenticateMcpKey } from "@/lib/mcp/auth";
import { createMcpServer } from "@/lib/mcp/server";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

/**
 * POST /api/mcp — MCP endpoint using JSON-RPC over HTTP.
 * Authenticates via Bearer API key, creates a stateless MCP server
 * scoped to the org, and processes JSON-RPC requests.
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateMcpKey(request.headers.get("authorization"));
  if (!auth) {
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32001, message: "Unauthorized" }, id: null },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null },
      { status: 400 }
    );
  }

  const server = createMcpServer(auth.orgId, auth.scopes);

  try {
    // Use in-memory transport pair to bridge Next.js request → MCP server
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);

    // Send the request through the client side of the transport
    // and collect the response
    const responsePromise = new Promise<unknown>((resolve) => {
      clientTransport.onmessage = (message) => {
        resolve(message);
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await clientTransport.send(body as any);
    const response = await responsePromise;

    await server.close();
    return NextResponse.json(response);
  } catch (err) {
    await server.close();
    console.error("MCP request error:", err);
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32603, message: "Internal error" }, id: null },
      { status: 500 }
    );
  }
}

/**
 * GET /api/mcp — return server info for MCP discovery
 */
export async function GET() {
  return NextResponse.json({
    name: "TeamPrompt MCP Server",
    version: "1.0.0",
    description: "Access your team's prompt library, run DLP checks, and log usage from any AI tool.",
    documentation: "https://teamprompt.app/help/mcp-integration",
    tools: ["search_prompts", "get_prompt", "list_templates", "check_dlp", "log_usage"],
  });
}
