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

export interface GoogleStyleguide2026Schema {
  version: string;
  upstreams: {
    googleStyleguide: string;
    googleSkills: string;
    openSourceGoogle: string;
    comprehensiveRust: string;
    deepMind: string;
    chromium: string;
    aosp: string;
  };
  rust: {
    edition: "2024";
    comprehensiveRustUrl: string;
    chromiumFfiSafety: {
      requireCxxOrCrubit: boolean;
      prohibitCatchUnwind: boolean;
      panicStrategy: "abort";
      forbidUncheckedUnsafe: boolean;
      gtestInterop: string;
    };
    linter: "clippy";
    formatter: "rustfmt";
    rules: string[];
  };
  typescript: {
    styleguideUrl: string;
    runtime: "bun";
    minBunVersion: string;
    commands: {
      format: "bun fmt";
      lint: "bun lint --type-aware";
      check: "bun check";
    };
    rules: string[];
  };
  cppChromium: {
    styleguideUrl: string;
    stdVersion: string;
    subsystems: string[];
    buildTools: Array<"gn" | "ninja" | "depot_tools" | "gclient" | "repo" | string>;
    rules: string[];
  };
  aospAndroid17: {
    apiLevel: number;
    releaseName: string;
    buildSystems: Array<"soong" | "bazel" | "repo" | string>;
    virtualDevice: {
      runtime: "cuttlefish";
      architecture: "x86_64";
      imageFlavor: string;
      launchCommand: string;
    };
    rules: string[];
  };
}

export interface GoogleChromeReposSchema {
  version: string;
  organization: "GoogleChrome";
  query: string;
  updatedAt: string;
  repositories: Array<{
    name: string;
    repoUrl: string;
    rankByStars: number;
    category: string;
    primaryLanguage: string;
    standards: string[];
    roleInWebStandards?: string;
  }>;
  standardsAlignment: {
    coreWebVitals: string[];
    pwaServiceWorker: string[];
    automationCDP: string[];
    renderingCSS: string[];
    securityIdentity: string[];
  };
}

