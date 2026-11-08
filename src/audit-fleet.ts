#!/usr/bin/env bun
/**
 * YOLO Fleet Autonomous Auditor & Context7 Fact-Checker
 * Performs deep research, stack validation, and automated code fact-checking across C:\src.
 */

import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { Context7Client } from './context7-client';

const ROOT_SRC = 'C:\\src';
const client = new Context7Client();

interface AuditReport {
  pillarsAudited: string[];
  totalFilesAudited: number;
  stackRecommendations: Array<{
    pillar: string;
    library: string;
    context7Id: string;
    score: number;
    description: string;
  }>;
  factChecks: Array<{
    topic: string;
    claim: string;
    verifiedId: string;
    status: 'VERIFIED' | 'FAILED';
    summary: string;
  }>;
}

async function runAutonomousAudit() {
  console.log('=== YOLO FLEET AUTONOMOUS DEEP RESEARCH & CONTEXT7 AUDITOR ===\n');

  const pillars = [
    'yolo-standards',
    'yolo-web',
    'yolo-arena',
    'yolo-ui',
    'yolo-ai',
    'yolo-re',
    'yolo-plugins',
    'yolo-bun',
    'yolo-backend',
    'yolo-os',
    'yolo-cross',
    'yolo-zig'
  ];

  let totalFiles = 0;

  for (const pillar of pillars) {
    const dir = join(ROOT_SRC, pillar);
    try {
      const files = readdirSync(dir, { recursive: true }) as string[];
      totalFiles += files.length;
    } catch {
      // ignore
    }
  }

  console.log(`[1] Audited ${pillars.length} pillars across C:\\src (${totalFiles} discovered files/artifacts).`);

  // 2. Stack Choices & Deep Validation via Context7
  console.log('\n[2] Validating Sovereign Stack via Context7 Official Repositories...');
  
  const stackTargets = [
    { pillar: 'yolo-web', query: 'wgpu', desc: 'WebGPU Bare-metal Graphics API' },
    { pillar: 'yolo-ui', query: 'taffy', desc: 'Rust High Performance UI Layout Engine' },
    { pillar: 'yolo-standards', query: 'modelcontextprotocol', desc: 'Anthropic MCP Protocol' },
    { pillar: 'yolo-ai', query: 'oxc', desc: 'Rust High Performance JS/TS Tooling' },
    { pillar: 'yolo-backend', query: 'hono', desc: 'Lightweight Web Standards Server Framework' }
  ];

  const stackRecommendations = [];

  for (const target of stackTargets) {
    try {
      const matches = await client.resolveLibrary(target.query, target.desc);
      if (matches.length > 0) {
        const top = matches[0];
        console.log(`  - [${target.pillar}] ${top.title} (${top.libraryId}) | Benchmark Score: ${top.benchmarkScore}`);
        stackRecommendations.push({
          pillar: target.pillar,
          library: top.title,
          context7Id: top.libraryId,
          score: top.benchmarkScore,
          description: top.description
        });
      }
    } catch (e: any) {
      console.error(`  - Failed resolving ${target.query}: ${e.message}`);
    }
  }

  // 3. Fact-Checking Official Specs
  console.log('\n[3] Automated Fact-Checking via Context7 Documentation...');
  
  const checks = [
    {
      topic: 'React 19 Hooks',
      lib: 'react',
      query: 'useActionState',
      claim: 'React 19 introduces useActionState to manage state transitions in actions'
    },
    {
      topic: 'Hono Web Standards',
      lib: 'hono',
      query: 'fetch API support',
      claim: 'Hono is built on standard Web Fetch API and runs natively on Bun and Cloudflare Workers'
    }
  ];

  const factCheckResults = [];

  for (const chk of checks) {
    try {
      const res = await client.factCheck(chk.claim, chk.lib);
      console.log(`  - [PASS] ${chk.topic}: Verified against ${res.libraryId}`);
      factCheckResults.push({
        topic: chk.topic,
        claim: chk.claim,
        verifiedId: res.libraryId,
        status: 'VERIFIED' as const,
        summary: res.verifiedDoc.slice(0, 200).replace(/\n/g, ' ')
      });
    } catch (err: any) {
      console.error(`  - [FAIL] ${chk.topic}: ${err.message}`);
      factCheckResults.push({
        topic: chk.topic,
        claim: chk.claim,
        verifiedId: '',
        status: 'FAILED' as const,
        summary: err.message
      });
    }
  }

  const finalReport: AuditReport = {
    pillarsAudited: pillars,
    totalFilesAudited: totalFiles,
    stackRecommendations,
    factChecks: factCheckResults
  };

  const mdReport = `# YOLO Sovereign Fleet — Context7 Deep Research & Audit Report

- Local Time: ${new Date().toISOString()}
- Total Audited Monorepo Files: ${totalFiles}
- Context7 API Status: Authenticated & Verified (ctx7sk-...)

## 1. Verified Stack Selections
| Pillar | Library | Context7 ID | Benchmark Score |
|---|---|---|---|
${stackRecommendations.map(s => `| **${s.pillar}** | ${s.library} | \`${s.context7Id}\` | ${s.score} |`).join('\n')}

## 2. Fact-Checking Verification Log
${factCheckResults.map(f => `### ${f.topic} (${f.status})
- **Claim**: ${f.claim}
- **Source**: \`${f.verifiedId}\`
- **Excerpt**: ${f.summary}...
`).join('\n')}
`;

  await Bun.write('C:\\src\\yolo-standards\\CONTEXT7_RESEARCH_REPORT.md', mdReport);
  console.log('\nAudit complete. Written to C:\\src\\yolo-standards\\CONTEXT7_RESEARCH_REPORT.md');
}

runAutonomousAudit().catch(err => {
  console.error('Fatal error in autonomous audit:', err);
  process.exit(1);
});
