/**
 * Exa AI Client for YOLO Fleet
 * Real-time neural search, contents extraction & deep research.
 */

export interface ExaSearchResult {
  id: string;
  title: string;
  url: string;
  score?: number;
  publishedDate?: string;
  author?: string;
  text?: string;
  highlights?: string[];
}

export interface ExaSearchResponse {
  results: ExaSearchResult[];
  searchTime: number;
  costDollars?: {
    total: number;
  };
}

export class ExaClient {
  private apiKey: string;
  private endpoint: string;

  constructor(apiKey?: string, endpoint = 'https://api.exa.ai') {
    this.apiKey = apiKey || process.env.EXA_API_KEY || '4f757cad-9c99-4bbf-bdf8-281fb4789dee';
    this.endpoint = endpoint;
  }

  async search(query: string, options: { numResults?: number; contents?: { text?: boolean; highlights?: boolean } } = {}): Promise<ExaSearchResponse> {
    const res = await fetch(`${this.endpoint}/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        numResults: options.numResults || 5,
        contents: options.contents || { highlights: true },
      }),
    });

    if (!res.ok) {
      throw new Error(`Exa API HTTP error: ${res.status} ${res.statusText}`);
    }

    return (await res.json()) as ExaSearchResponse;
  }
}
