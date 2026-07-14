'use client';

import { useEffect, useState } from 'react';
import { FileText, Code, TestTube, ScrollText, RefreshCw } from 'lucide-react';

interface Docs {
  architecture: string;
  apiDocs: string;
  changelog: string;
  testing: string;
}

const tabs = [
  { id: 'architecture', label: 'Architecture', icon: FileText, file: 'architecture.md' },
  { id: 'apiDocs',      label: 'API Docs',     icon: Code,      file: 'api.md' },
  { id: 'changelog',    label: 'Changelog',    icon: ScrollText, file: 'changelog.md' },
  { id: 'testing',      label: 'Testing',      icon: TestTube,  file: 'testing.md' },
] as const;

type TabId = typeof tabs[number]['id'];

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push(
        <pre
          key={key++}
          className="rounded-lg p-4 my-3 overflow-auto text-sm font-mono leading-relaxed"
          style={{ background: 'var(--code-bg)', color: 'var(--code-text)' }}
        >
          {codeLines.join('\n')}
        </pre>
      );
    }

    // H1
    else if (line.startsWith('# ')) {
      nodes.push(
        <h1
          key={key++}
          className="text-lg mt-1 mb-0.5"
          style={{ fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
        >
          {line.slice(2)}
        </h1>
      );
    }

    // H2
    else if (line.startsWith('## ')) {
      nodes.push(
        <h2
          key={key++}
          className="text-sm mt-5 mb-2"
          style={{ fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--text-primary)' }}
        >
          {line.slice(3)}
        </h2>
      );
    }

    // Blockquote / metadata line
    else if (line.startsWith('> ')) {
      nodes.push(
        <p key={key++} className="text-xs italic mb-2" style={{ color: 'var(--text-muted)' }}>
          {line.slice(2)}
        </p>
      );
    }

    // Divider
    else if (line.startsWith('---')) {
      nodes.push(
        <hr key={key++} className="my-3" style={{ borderColor: 'var(--border)' }} />
      );
    }

    // Success test line
    else if (line.startsWith('- ✅')) {
      nodes.push(
        <div key={key++} className="flex items-start gap-2 text-sm ml-2 my-0.5" style={{ color: 'var(--green)' }}>
          <span>{line.slice(2)}</span>
        </div>
      );
    }

    // Fail test line
    else if (line.startsWith('- ❌')) {
      nodes.push(
        <div key={key++} className="flex items-start gap-2 text-sm ml-2 my-0.5" style={{ color: 'var(--red)' }}>
          <span>{line.slice(2)}</span>
        </div>
      );
    }

    // Warning test line
    else if (line.startsWith('- ⚠️')) {
      nodes.push(
        <div key={key++} className="flex items-start gap-2 text-sm ml-2 my-0.5" style={{ color: 'var(--yellow)' }}>
          <span>{line.slice(2)}</span>
        </div>
      );
    }

    // Bullet with backtick
    else if (line.startsWith('- `')) {
      const inner = line.slice(3, line.lastIndexOf('`'));
      nodes.push(
        <div key={key++} className="flex items-start gap-2 text-sm ml-2 my-0.5" style={{ color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <code
            className="px-1.5 py-0.5 rounded text-xs"
            style={{ background: 'var(--code-bg)', color: 'var(--code-text)' }}
          >
            {inner}
          </code>
        </div>
      );
    }

    // Regular bullet
    else if (line.startsWith('- ')) {
      nodes.push(
        <div key={key++} className="flex items-start gap-2 text-sm ml-2 my-0.5" style={{ color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span>{line.slice(2)}</span>
        </div>
      );
    }

    // Bold label (e.g. **File:**)
    else if (/^\*\*[^*]+\*\*:?$/.test(line.trim())) {
      nodes.push(
        <p
          key={key++}
          className="text-sm mt-3 mb-1"
          style={{ fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
        >
          {line.replace(/\*\*/g, '')}
        </p>
      );
    }

    // Empty line
    else if (line.trim() === '') {
      nodes.push(<div key={key++} className="h-1" />);
    }

    // Regular paragraph with inline code
    else {
      const parts = line.split(/(`[^`]+`)/g);
      nodes.push(
        <p key={key++} className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {parts.map((part, pi) =>
            part.startsWith('`') && part.endsWith('`') ? (
              <code
                key={pi}
                className="px-1 py-0.5 rounded text-xs mx-0.5"
                style={{ background: 'var(--code-bg)', color: 'var(--code-text)' }}
              >
                {part.slice(1, -1)}
              </code>
            ) : (
              part
            )
          )}
        </p>
      );
    }

    i++;
  }

  return <div className="space-y-0.5">{nodes}</div>;
}

export default function DocumentationPage() {
  const [docs, setDocs] = useState<Docs | null>(null);
  const [active, setActive] = useState<TabId>('architecture');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/docs');
      setDocs(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const activeTab = tabs.find((t) => t.id === active)!;
  const content = docs?.[active] || '';

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl"
            style={{ fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
          >
            Documentation
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Auto-generated from your codebase
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm transition-colors"
          style={{
            color: 'var(--text-secondary)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-0.5 p-1 rounded-xl w-fit"
        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
      >
        {tabs.map(({ id, label, icon: Icon }) => {
          const active_ = active === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all"
              style={{
                fontWeight: active_ ? 500 : 400,
                color: active_ ? 'var(--text-primary)' : 'var(--text-muted)',
                background: active_ ? 'var(--bg-card)' : 'transparent',
                boxShadow: active_ ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                border: active_ ? '1px solid var(--border)' : '1px solid transparent',
                letterSpacing: active_ ? '-0.01em' : 'normal',
              }}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={active_ ? 2 : 1.75} />
              {label}
            </button>
          );
        })}
      </div>

      {/* File path badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Saved to</span>
        <code
          className="text-xs px-2 py-0.5 rounded"
          style={{ background: 'var(--code-bg)', color: 'var(--code-text)' }}
        >
          docs/{activeTab.file}
        </code>
      </div>

      {/* Content panel */}
      <div
        className="rounded-xl p-6 min-h-96"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <RefreshCw
              className="w-5 h-5 animate-spin"
              style={{ color: 'var(--accent)' }}
            />
          </div>
        ) : content ? (
          <MarkdownRenderer content={content} />
        ) : (
          <div className="text-center py-16">
            <FileText
              className="w-9 h-9 mx-auto mb-3"
              style={{ color: 'var(--border-strong)' }}
              strokeWidth={1.5}
            />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No documentation generated yet.
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
              Go to Dashboard → Trigger Demo Hook or Scan Codebase.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
