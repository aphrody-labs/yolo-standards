export interface WebAssemblySchema {
  version: string;
  coreSpecUrl: string;
  componentModelSpecUrl: string;
  valTypes: string[];
  componentTypes: string[];
  sections: Array<{
    id: number;
    name: string;
    description: string;
  }>;
  canonicalAbis?: string[];
}

export interface MDNCompatSchema {
  feature: string;
  mdn_url?: string;
  support: Record<
    string,
    {
      version_added: string | boolean | null;
      version_removed?: string | boolean | null;
      prefix?: string;
      notes?: string | string[];
    }
  >;
  subfeatures?: Record<string, any>;
}

export interface TC39ProposalsSchema {
  proposals: Array<{
    name: string;
    stage: number;
    champions: string[];
    url: string;
    tags?: string[];
    notes?: string;
  }>;
}

export interface MCPSchema2026 {
  version: string;
  protocolVersion: string;
  transports: Array<"stdio" | "sse" | "websocket" | "memory">;
  capabilities: {
    server: {
      tools?: boolean;
      resources?: boolean;
      prompts?: boolean;
      logging?: boolean;
      streaming?: boolean;
    };
    client: {
      roots?: boolean;
      sampling?: boolean;
      experimental?: Record<string, any>;
    };
  };
  methods: Array<{
    name: string;
    kind: "request" | "notification";
    paramsSchema?: Record<string, any>;
    resultSchema?: Record<string, any>;
  }>;
}
