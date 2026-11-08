import { StandardsLoader } from "../../../src/loader.ts";
import { STANDARDS_AND_PROTOCOLS_MATRIX } from "../../../src/registry/standards-matrix-2026.ts";
import { TRI_PLATFORM_STANDARDS_SCAN } from "../../../src/registry/tri-platform-scan.ts";
import { PURGED_GROUND_TRUTH_INVARIANTS } from "../../../src/registry/hallucination-purge.ts";
import { EXHAUSTIVE_STANDARDS_REGISTRY } from "../../../src/registry/continuous-standards-engine.ts";
import { BUN_UPSTREAM_ECOSYSTEM_MAP } from "../../../src/registry/bun-ecosystem-mapper.ts";

export interface CompleteStandardsCorpus {
  summary: {
    totalStandardsTracked: number;
    categoriesCount: number;
    schemasLoaded: number;
    timestamp: string;
  };
  schemas: {
    webassembly: any;
    mdnCompat: any;
    tc39: any;
    mcp2026: any;
    googleStyleguide2026: any;
    googleChromeRepos: any;
  };
  matrix: typeof STANDARDS_AND_PROTOCOLS_MATRIX;
  triPlatformScan: typeof TRI_PLATFORM_STANDARDS_SCAN;
  purgedGroundTruth: typeof PURGED_GROUND_TRUTH_INVARIANTS;
  continuousRecords: typeof EXHAUSTIVE_STANDARDS_REGISTRY;
  bunEcosystem: typeof BUN_UPSTREAM_ECOSYSTEM_MAP;
}

export class StandardsCorpusRegistry {
  private loader: StandardsLoader;
  private cache: CompleteStandardsCorpus | null = null;

  constructor() {
    this.loader = new StandardsLoader();
  }

  public async getCompleteCorpus(): Promise<CompleteStandardsCorpus> {
    if (this.cache) return this.cache;

    const [wasm, mdn, tc39, mcp, google, chrome] = await Promise.all([
      this.loader.loadWebAssembly(),
      this.loader.loadMDNCompat(),
      this.loader.loadTC39(),
      this.loader.loadMCP2026(),
      this.loader.loadGoogleStyleguide2026(),
      this.loader.loadGoogleChromeRepos()
    ]);

    let totalCount = 0;
    totalCount += wasm.valTypes?.length ?? 0;
    totalCount += tc39.proposals?.length ?? 0;
    totalCount += mcp.capabilities ? Object.keys(mcp.capabilities).length : 0;
    totalCount += chrome.repositories?.length ?? 0;
    totalCount += STANDARDS_AND_PROTOCOLS_MATRIX.reduce((acc, d) => acc + d.subdomains.reduce((a, s) => a + s.standards.length, 0), 0);
    totalCount += TRI_PLATFORM_STANDARDS_SCAN.length;
    totalCount += PURGED_GROUND_TRUTH_INVARIANTS.length;

    // Count exhaustive categories
    for (const cat of Object.values(EXHAUSTIVE_STANDARDS_REGISTRY)) {
      if (Array.isArray(cat)) {
        totalCount += cat.length;
      }
    }

    this.cache = {
      summary: {
        totalStandardsTracked: totalCount,
        categoriesCount: 6 + STANDARDS_AND_PROTOCOLS_MATRIX.length + Object.keys(EXHAUSTIVE_STANDARDS_REGISTRY).length,
        schemasLoaded: 6,
        timestamp: new Date().toISOString()
      },
      schemas: {
        webassembly: wasm,
        mdnCompat: mdn,
        tc39,
        mcp2026: mcp,
        googleStyleguide2026: google,
        googleChromeRepos: chrome
      },
      matrix: STANDARDS_AND_PROTOCOLS_MATRIX,
      triPlatformScan: TRI_PLATFORM_STANDARDS_SCAN,
      purgedGroundTruth: PURGED_GROUND_TRUTH_INVARIANTS,
      continuousRecords: EXHAUSTIVE_STANDARDS_REGISTRY,
      bunEcosystem: BUN_UPSTREAM_ECOSYSTEM_MAP
    };

    return this.cache;
  }
}
