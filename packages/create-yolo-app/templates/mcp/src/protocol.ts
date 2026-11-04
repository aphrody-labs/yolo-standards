export interface McpRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
  signature?: string;
}

export interface McpResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export class McpRouter {
  private tools = new Map<string, (args: any) => Promise<unknown> | unknown>();
  private toolDefinitions: ToolDefinition[] = [];

  registerTool(def: ToolDefinition, handler: (args: any) => Promise<unknown> | unknown): void {
    this.toolDefinitions.push(def);
    this.tools.set(def.name, handler);
  }

  async handle(req: McpRequest): Promise<McpResponse> {
    if (req.method === "tools/list") {
      return {
        jsonrpc: "2.0",
        id: req.id,
        result: {
          tools: this.toolDefinitions,
        },
      };
    }

    if (req.method === "tools/call") {
      const toolName = (req.params as any)?.name;
      const args = (req.params as any)?.arguments ?? {};
      const handler = this.tools.get(toolName);

      if (!handler) {
        return {
          jsonrpc: "2.0",
          id: req.id,
          error: {
            code: -32601,
            message: "Method '" + toolName + "' not found",
          },
        };
      }

      try {
        const result = await handler(args);
        return {
          jsonrpc: "2.0",
          id: req.id,
          result: {
            content: [
              {
                type: "text",
                text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
              },
            ],
          },
        };
      } catch (err: any) {
        return {
          jsonrpc: "2.0",
          id: req.id,
          error: {
            code: -32000,
            message: err?.message ?? "Execution failed",
          },
        };
      }
    }

    return {
      jsonrpc: "2.0",
      id: req.id,
      error: {
        code: -32601,
        message: "Unknown MCP method '" + req.method + "'",
      },
    };
  }
}
