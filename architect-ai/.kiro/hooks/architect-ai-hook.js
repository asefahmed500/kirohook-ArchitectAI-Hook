#!/usr/bin/env node
/**
 * ArchitectAI Hook
 * Triggered by Kiro on PostToolUse (fs_write) events.
 * Reads changed file → calls /api/analyze → updates all docs automatically.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const WATCHED_DIRS = ['src/', 'app/', 'pages/', 'components/', 'lib/', 'services/', 'api/', 'hooks/'];
const CODE_EXTS = ['.ts', '.tsx', '.js', '.jsx'];
const SKIP_DIRS = ['docs/', '.kiro/', 'node_modules/', '.next/'];

let raw = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', async () => {
  try {
    const event = JSON.parse(raw || '{}');

    // Only act on PostToolUse for fs_write
    if (event.hook_event_name !== 'postToolUse' || event.tool_name !== 'fs_write') {
      process.exit(0);
    }

    const toolInput = event.tool_input || {};
    const filePath = (toolInput.path || '').replace(/\\/g, '/');

    // Only watch code files in relevant dirs
    const isWatched = WATCHED_DIRS.some((d) => filePath.includes(d));
    const isCodeFile = CODE_EXTS.some((ext) => filePath.endsWith(ext));
    const isSkipped = SKIP_DIRS.some((d) => filePath.includes(d));

    if (!isWatched || !isCodeFile || isSkipped) {
      process.exit(0);
    }

    log(`\n🔗 ArchitectAI Hook triggered`);
    log(`   File: ${filePath}`);
    log(`   Time: ${new Date().toLocaleTimeString()}`);

    // Read file content
    let content = toolInput.text || toolInput.file_text || '';
    if (!content) {
      try {
        const cwd = event.cwd || process.cwd();
        const absPath = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
        content = fs.readFileSync(absPath, 'utf-8');
      } catch {
        log(`   ⚠️  Could not read file content — using empty string`);
      }
    }

    log(`🔍 Analyzing code structure...`);
    const result = await callApi('POST', '/api/analyze', { filePath, content });

    if (result.success) {
      const a = result.analysis || {};
      log(`✅ Documentation updated successfully!`);
      log(`   🧩 Components: ${a.components?.length || 0}`);
      log(`   ⚙️  Services:   ${a.services?.length || 0}`);
      log(`   🔌 API Routes: ${a.apiRoutes?.length || 0}`);
      log(`   📦 Models:     ${a.models?.length || 0}`);
      log(`📄 Saved: architecture.md • api.md • changelog.md • testing.md • system-diagram.mmd`);
    } else {
      log(`⚠️  Analysis error: ${result.error || 'Unknown error'}`);
    }

    process.exit(0);
  } catch (e) {
    process.stderr.write(`ArchitectAI Hook error: ${e.message}\n`);
    process.exit(1);
  }
});

function log(msg) {
  process.stdout.write(msg + '\n');
}

function callApi(method, apiPath, payload) {
  return new Promise((resolve) => {
    const body = JSON.stringify(payload);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: apiPath,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve({ success: false, error: 'Invalid JSON from API' });
          }
        });
      }
    );

    req.on('error', (e) => {
      resolve({ success: false, error: `API unreachable: ${e.message}` });
    });

    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ success: false, error: 'Request timed out' });
    });

    req.write(body);
    req.end();
  });
}
