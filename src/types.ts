export interface WebGPUSchema {
  version: string;
  specUrl: string;
  features: string[];
  limits: Record<string, number>;
  interfaces: Array<{
    name: string;
    kind: "interface" | "dictionary" | "enum" | "typedef";
    members?: Array<{
      name: string;
      type: string;
      optional?: boolean;
      readonly?: boolean;
    }>;
  }>;
}

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

export interface KhronosRegistrySchema {
  api: "vulkan" | "opengl" | "opengles";
  version: string;
  types: Array<{
    name: string;
    category: string;
  }>;
  enums: Array<{
    name: string;
    value: string | number;
  }>;
  commands: Array<{
    name: string;
    returnType: string;
    params: Array<{
      name: string;
      type: string;
    }>;
  }>;
}

export interface WaylandProtocolSchema {
  protocol: string;
  interfaces: Array<{
    name: string;
    version: number;
    description?: string;
    requests?: Array<{
      name: string;
      args?: Array<{
        name: string;
        type: string;
        interface?: string;
      }>;
    }>;
    events?: Array<{
      name: string;
      args?: Array<{
        name: string;
        type: string;
      }>;
    }>;
  }>;
}

export interface LinuxKernelSchema {
  kernelVersion: string;
  cgroupsV2: {
    controllers: string[];
    coreFiles: string[];
  };
  sysfs: {
    subsystems: string[];
  };
  ebpf: {
    programTypes: string[];
    mapTypes: string[];
    attachTypes: string[];
  };
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
