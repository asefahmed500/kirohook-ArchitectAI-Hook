import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  analyzeCode,
  generateArchitectureDocs,
  generateApiDocs,
  generateMermaidDiagram,
  generateChangelog,
  generateTestingRecommendations,
  saveDocs,
  CodeAnalysis,
} from '@/lib/analyzer';

const CWD = process.cwd();
const LOG_PATH = path.join(CWD, 'docs', 'analysis-log.json');

type HistoryEntry = { timestamp: string; filePath: string; analysis: CodeAnalysis };

function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(fs.readFileSync(LOG_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryEntry[]) {
  const docsDir = path.join(CWD, 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(LOG_PATH, JSON.stringify(history, null, 2), 'utf-8');
}

function rebuildAndSave(history: HistoryEntry[]) {
  const analysesMap = new Map<string, CodeAnalysis>();
  history.forEach((h) => {
    if (!analysesMap.has(h.filePath)) analysesMap.set(h.filePath, h.analysis);
  });

  const architecture = generateArchitectureDocs(analysesMap);
  const apiDocs = generateApiDocs(analysesMap);
  const diagram = generateMermaidDiagram(analysesMap);
  const changelog = generateChangelog(history.slice(0, 30));
  const testing = generateTestingRecommendations(analysesMap);

  saveDocs(CWD, { architecture, apiDocs, changelog, testing, diagram });
  return { architecture, apiDocs, diagram, changelog, testing, analysesMap };
}

// POST /api/analyze — analyze a single file (called by hook or demo button)
export async function POST(req: NextRequest) {
  try {
    const { filePath, content } = await req.json();

    if (!filePath || content === undefined) {
      return NextResponse.json({ error: 'filePath and content required' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const analysis = analyzeCode(filePath, content);

    let history = loadHistory();
    history.unshift({ timestamp, filePath, analysis });
    history = history.slice(0, 100);

    const { architecture, apiDocs, diagram, changelog, testing } = rebuildAndSave(history);
    saveHistory(history);

    return NextResponse.json({
      success: true,
      timestamp,
      analysis,
      docs: { architecture, apiDocs, changelog, testing, diagram },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/analyze — scan all codebase files at once
export async function PUT() {
  try {
    const watchedDirs = ['src', 'app', 'components', 'lib', 'hooks', 'services'];
    const codeExts = ['.ts', '.tsx', '.js', '.jsx'];
    const skipDirs = ['node_modules', '.next', '.git', 'docs', '.kiro'];

    const files: string[] = [];
    const walk = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          if (!skipDirs.includes(entry.name)) walk(path.join(dir, entry.name));
        } else if (codeExts.includes(path.extname(entry.name))) {
          files.push(path.join(dir, entry.name));
        }
      }
    };

    watchedDirs.forEach((d) => walk(path.join(CWD, d)));

    const timestamp = new Date().toISOString();
    let history = loadHistory();

    files.forEach((absPath) => {
      try {
        const content = fs.readFileSync(absPath, 'utf-8');
        const filePath = absPath.replace(CWD, '').replace(/\\/g, '/').replace(/^\//, '');
        const analysis = analyzeCode(filePath, content);
        history.unshift({ timestamp, filePath, analysis });
      } catch {}
    });

    history = history.slice(0, 100);
    const { architecture, apiDocs, diagram, changelog, testing } = rebuildAndSave(history);
    saveHistory(history);

    return NextResponse.json({
      success: true,
      scanned: files.length,
      timestamp,
      docs: { architecture, apiDocs, changelog, testing, diagram },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
