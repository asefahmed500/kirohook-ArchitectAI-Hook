'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw, GitGraph, Code } from 'lucide-react';

export default function DiagramClient() {
  const [raw, setRaw] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'visual' | 'code'>('visual');
  const containerRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/docs');
      const json = await res.json();
      setRaw(json.diagram || '');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!raw || view !== 'visual' || !containerRef.current) return;
    import('mermaid').then((m) => {
      m.default.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        themeVariables: {
          primaryColor: '#ede9ff',
          primaryTextColor: '#1a1917',
          primaryBorderColor: '#c4b8ff',
          lineColor: '#9c9894',
          secondaryColor: '#f2f1ee',
          tertiaryColor: '#f8f7f4',
        },
      });
      const id = 'mermaid-' + Date.now();
      m.default.render(id, raw).then(({ svg }) => {
        if (containerRef.current) containerRef.current.innerHTML = svg;
      }).catch(console.error);
    });
  }, [raw, view]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl"
            style={{ fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
          >
            Architecture Diagram
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Auto-generated Mermaid diagram
          </p>
        </div>
        <div className="flex gap-2">
          <div
            className="flex gap-0.5 p-1 rounded-lg"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
          >
            {(['visual', 'code'] as const).map((v) => {
              const isActive = view === v;
              return (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all"
                  style={{
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    background: isActive ? 'var(--bg-card)' : 'transparent',
                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                  }}
                >
                  {v === 'visual'
                    ? <><GitGraph className="w-3.5 h-3.5" strokeWidth={isActive ? 2 : 1.75} /> Visual</>
                    : <><Code className="w-3.5 h-3.5" strokeWidth={isActive ? 2 : 1.75} /> Source</>
                  }
                </button>
              );
            })}
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm"
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
      </div>

      <div
        className="rounded-xl p-6 min-h-96"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <RefreshCw className="w-5 h-5 animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        ) : !raw ? (
          <div className="text-center py-16">
            <GitGraph
              className="w-9 h-9 mx-auto mb-3"
              style={{ color: 'var(--border-strong)' }}
              strokeWidth={1.5}
            />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No diagram generated yet.
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
              Go to Dashboard and trigger the hook.
            </p>
          </div>
        ) : view === 'code' ? (
          <pre
            className="text-sm font-mono leading-relaxed whitespace-pre-wrap"
            style={{ color: 'var(--code-text)' }}
          >
            {raw}
          </pre>
        ) : (
          <div
            ref={containerRef}
            className="flex items-center justify-center overflow-auto mermaid-container"
          />
        )}
      </div>
    </div>
  );
}
