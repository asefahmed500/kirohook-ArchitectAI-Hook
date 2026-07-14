'use client';

import { useEffect, useState } from 'react';
import { Activity, Zap, RefreshCw, FileCode } from 'lucide-react';

interface HistoryEntry {
  timestamp: string;
  filePath: string;
  analysis?: {
    components: { name: string }[];
    services: { name: string }[];
    apiRoutes: { method: string; path: string }[];
    models: { name: string }[];
  };
}

const TAG_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  component: { color: 'var(--blue)',   bg: 'var(--blue-subtle)',   border: 'var(--blue-border)' },
  service:   { color: 'var(--accent)', bg: 'var(--accent-subtle)', border: '#c4b8ff' },
  route:     { color: 'var(--green)',  bg: 'var(--green-subtle)',  border: 'var(--green-border)' },
  model:     { color: 'var(--yellow)', bg: 'var(--yellow-subtle)', border: 'var(--yellow-border)' },
};

function Tag({ type, label }: { type: keyof typeof TAG_STYLES; label: string }) {
  const s = TAG_STYLES[type];
  return (
    <span
      className="text-xs px-2 py-0.5 rounded"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {label}
    </span>
  );
}

export default function ActivityPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/docs');
      const json = await res.json();
      setHistory(json.history || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl"
            style={{ fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
          >
            Activity
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Hook execution history
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

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <RefreshCw className="w-5 h-5 animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      ) : history.length === 0 ? (
        <div
          className="rounded-xl p-16 text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <Activity
            className="w-9 h-9 mx-auto mb-3"
            style={{ color: 'var(--border-strong)' }}
            strokeWidth={1.5}
          />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No activity yet.
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
            Trigger the hook from the Dashboard to see activity here.
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          {history.map((entry, i) => (
            <div
              key={i}
              className="p-4"
              style={{
                background: 'var(--bg-card)',
                borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--accent-subtle)' }}
                  >
                    <Zap className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} strokeWidth={1.75} />
                      <span
                        className="text-sm font-mono"
                        style={{ color: 'var(--text-primary)', fontWeight: 500 }}
                      >
                        {entry.filePath}
                      </span>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    color: 'var(--green)',
                    background: 'var(--green-subtle)',
                    border: '1px solid var(--green-border)',
                  }}
                >
                  ✓ Completed
                </span>
              </div>

              {entry.analysis && (
                <div className="flex flex-wrap gap-1.5 ml-10">
                  {entry.analysis.components.map((c) => (
                    <Tag key={c.name} type="component" label={`🧩 ${c.name}`} />
                  ))}
                  {entry.analysis.services.map((s) => (
                    <Tag key={s.name} type="service" label={`⚙️ ${s.name}`} />
                  ))}
                  {entry.analysis.apiRoutes.map((r, ri) => (
                    <Tag key={ri} type="route" label={`🔌 ${r.method} ${r.path}`} />
                  ))}
                  {entry.analysis.models.map((m) => (
                    <Tag key={m.name} type="model" label={`📦 ${m.name}`} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
