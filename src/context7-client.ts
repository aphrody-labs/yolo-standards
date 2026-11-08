/**
 * Context7 Client Engine for YOLO Fleet
 * Real-time documentation resolver, query-docs engine, stack validator & codebase auditor.
 */

export interface LibraryMatch {
  title: string;
  libraryId: string;
  description: string;
  codeSnippets: number;
  sourceReputation: string;
  benchmarkScore: number;
  versions?: string[];
}

export interface DocSnippet {
  title: string;
  sourceUrl: string;
  content: string;
}

export class Context7Client {
  private apiKey: string;
  private endpoint: string;

  constructor(apiKey?: string, endpoint = 'https://mcp.context7.com/mcp') {
    this.apiKey = apiKey || process.env.CONTEXT7_API_KEY || 'ctx7sk-b3200192-e98a-478d-954f-a9cf28d4c554';
    this.endpoint = endpoint;
  }

  private async callTool(name: string, args: Record<string, any>): Promise<string> {
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name,
          arguments: args,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Context7 MCP HTTP error: ${res.status} ${res.statusText}`);
    }

    const text = await res.text();
    // Parse SSE lines
    const match = text.match(/data:\s*(\{.*\})/);
    if (!match) {
      throw new Error(`Failed to parse SSE payload from Context7: ${text}`);
    }

    const json = JSON.parse(match[1]);
    if (json.error) {
      throw new Error(`Context7 error: ${JSON.stringify(json.error)}`);
    }

    const content = json.result?.content;
    if (Array.isArray(content) && content[0]?.text) {
      return content[0].text;
    }
    return JSON.stringify(json.result);
  }

  /**
   * Resolves a library name into a Context7 library ID (e.g. /vercel/next.js)
   */
  async resolveLibrary(libraryName: string, query = 'getting started'): Promise<LibraryMatch[]> {
    const raw = await this.callTool('resolve-library-id', { libraryName, query });
    const entries = raw.split('----------');
    const results: LibraryMatch[] = [];

    for (const entry of entries) {
      const titleMatch = entry.match(/Title:\s*(.+)/);
      const idMatch = entry.match(/Context7-compatible library ID:\s*(.+)/);
      const descMatch = entry.match(/Description:\s*(.+)/);
      const snippetsMatch = entry.match(/Code Snippets:\s*(\d+)/);
      const repMatch = entry.match(/Source Reputation:\s*(.+)/);
      const scoreMatch = entry.match(/Benchmark Score:\s*([\d.]+)/);

      if (idMatch) {
        results.push({
          title: titleMatch ? titleMatch[1].trim() : '',
          libraryId: idMatch[1].trim(),
          description: descMatch ? descMatch[1].trim() : '',
          codeSnippets: snippetsMatch ? parseInt(snippetsMatch[1], 10) : 0,
          sourceReputation: repMatch ? repMatch[1].trim() : 'Unknown',
          benchmarkScore: scoreMatch ? parseFloat(scoreMatch[1]) : 0,
        });
      }
    }

    return results;
  }

  /**
   * Queries documentation for a given library ID
   */
  async queryDocs(libraryId: string, query: string): Promise<string> {
    return await this.callTool('query-docs', { libraryId, query });
  }

  /**
   * Fact-check a technical claim against authoritative library documentation
   */
  async factCheck(claim: string, targetLibrary: string): Promise<{ claim: string; libraryId: string; verifiedDoc: string }> {
    const libs = await this.resolveLibrary(targetLibrary, claim);
    if (libs.length === 0) {
      throw new Error(`No library documentation matched for '${targetLibrary}'`);
    }
    const bestLib = libs[0].libraryId;
    const doc = await this.queryDocs(bestLib, claim);
    return {
      claim,
      libraryId: bestLib,
      verifiedDoc: doc,
    };
  }
}
