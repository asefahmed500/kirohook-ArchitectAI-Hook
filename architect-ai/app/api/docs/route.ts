import { NextResponse } from 'next/server';
import { loadDocs } from '@/lib/analyzer';
import fs from 'fs';
import path from 'path';

const CWD = process.cwd();

export async function GET() {
  try {
    const docs = loadDocs(CWD);

    const logPath = path.join(CWD, 'docs', 'analysis-log.json');
    let history: { timestamp: string; filePath: string }[] = [];
    try {
      history = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
    } catch {}

    return NextResponse.json({
      ...docs,
      lastAnalysis: history[0]?.timestamp ?? null,
      totalFilesScanned: new Set(history.map((h) => h.filePath)).size,
      history: history.slice(0, 20),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
