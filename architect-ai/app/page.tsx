'use client';

import { useEffect, useState } from 'react';
import { Clock, Files, CheckCircle, Zap, RefreshCw, Play, ScanSearch } from 'lucide-react';

interface DocsData {
  lastAnalysis: string | null;
  totalFilesScanned: number;
  architecture: string;
  apiDocs: string;
  changelog: string;
  testing: string;
  diagram: string;
  history: { timestamp: string; filePath: string }[];
}

const DEMO_CONTENT = `
export class UserService {
  async createUser(data: { name: string; email: string }) {
    return { id: Math.random(), ...data };
  }
  async getUserById(id: number) {
    return { id, name: 'Demo User', email: 'demo@example.com' };
  }
}
export class OrderService {
  async createOrder(data: { userId: number; items: string[] }) {
    return { id: Math.random(), ...data, status: 'pending' };
  }
}
export async function POST(req: Request) {
  const body = await req.json();
  return Response.json({ success: true, data: body });
}
export async function GET() {
  return Response.json({ users: [] });
}
export default function UserCard({ name, email }: { name: string; email: string }) {
  return <div>{name} — {email}</div>;
}
export interface User { id: number; name: string; email: string; createdAt: string; }
`;

export default function DashboardPage() {
  const [data, setData] = useState<DocsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [banner, setBanner] = useState<{ msg: string; ok: boolean } | null>(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/docs');
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const showBanner = (msg: string, ok: boolean) => {
    setBanner({ msg, ok });
    setTimeout(() => setBanner(null), 4000);
  };

  const triggerDemo = async () => {
    setTriggering(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: 'src/services/UserService.ts', content: DEMO_CONTENT }),
      });
      const result = await res.json();
      if (result.success) {
        showBanner('Hook executed — docs updated successfully.', true);
        await fetchDocs();
      } else {
        showBanner('Error: ' + result.error, false);
      }
    } finally {
      setTriggering(false);
    }
  };

  const scanCodebase = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/analyze', { method: 'PUT' });
      const result = await res.json();
      if (result.success) {
        showBanner(`Scanned ${result.scanned} files — docs updated.`, true);
        await fetchDocs();
      } else {
        showBanner('Scan failed: ' + result.error, false);
      }
    } finally {
      setScanning(false);
    }
  };

  const stats = [
    {
      label: 'Last Analysis',
      value: data?.lastAnalysis ? new Date(data.lastAnalysis).toLocaleTimeString() : 'Never',
      icon: Clock,
      accent: 'var(--accent)',
      bg: 'var(--accent-subtle)',
    },
    {
      label: 'Files Scanned',
      value: String(data?.totalFilesScanned ?? 0),
      icon: Files,
      accent: 'var(--blue)',
      bg: 'var(--blue-subtle)',
    },
    {
      label: 'Hook Triggers',
      value: String(data?.history?.length ?? 0),
      icon: Zap,
      accent: 'var(--yellow)',
      bg: 'var(--yellow-subtle)',
    },
    {
      label: 'Doc Status',
      value: data?.architecture ? 'Up to date' : 'Pending',
      icon: CheckCircle,
      accent: data?.architecture ? 'var(--green)' : 'var(--text-muted)',
      bg: data?.architecture ? 'var(--green-subtle)' : 'var(--bg-subtle)',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-7">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl"
            style={{ fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
          >
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Kiro Hook auto-documentation engine
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={fetchDocs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm transition-colors"
            style={{
              fontWeight: 400,
              color: 'var(--text-secondary)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={scanCodebase}
            disabled={scanning}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            style={{
              fontWeight: 500,
              color: 'var(--blue)',
              background: 'var(--blue-subtle)',
              border: '1px solid var(--blue-border)',
            }}
          >
            <ScanSearch className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning...' : 'Scan Codebase'}
          </button>
          <button
            onClick={triggerDemo}
            disabled={triggering}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            style={{
              fontWeight: 500,
              color: '#fff',
              background: 'var(--accent)',
            }}
          >
            <Play className={`w-3.5 h-3.5 ${triggering ? 'animate-pulse' : ''}`} />
            {triggering ? 'Running...' : 'Trigger Demo Hook'}
          </button>
        </div>
      </div>

      {/* Banner */}
      {banner && (
        <div
          className="px-4 py-3 rounded-lg text-sm"
          style={{
            color: banner.ok ? 'var(--green)' : 'var(--red)',
            background: banner.ok ? 'var(--green-subtle)' : 'var(--red-subtle)',
            border: `1px solid ${banner.ok ? 'var(--green-border)' : 'var(--red-border)'}`,
          }}
        >
          {banner.ok ? '✓ ' : '✕ '}{banner.msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, accent, bg }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ background: bg }}
            >
              <Icon className="w-4 h-4" style={{ color: accent }} strokeWidth={1.75} />
            </div>
            <div
              className="text-xl"
              style={{ fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
            >
              {value}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h2
          className="text-sm mb-4 flex items-center gap-2"
          style={{ fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}
        >
          <Zap className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} strokeWidth={2} />
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { step: '1', title: 'Code change', desc: 'Save a file in src/, app/, or services/' },
            { step: '2', title: 'Hook fires', desc: 'Kiro detects the fs_write event' },
            { step: '3', title: 'Analyze', desc: 'Components, services & routes extracted' },
            { step: '4', title: 'Docs saved', desc: 'All 5 doc files regenerated instantly' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 text-white"
                style={{ fontWeight: 600, background: 'var(--accent)', fontSize: '11px' }}
              >
                {step}
              </div>
              <div>
                <div className="text-sm" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                  {title}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent executions */}
      <div
        className="rounded-xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2
            className="text-sm"
            style={{ fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}
          >
            Recent hook executions
          </h2>
        </div>
        {data?.history && data.history.length > 0 ? (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {data.history.slice(0, 8).map((h, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: 'var(--green)' }}
                  />
                  <span
                    className="text-sm font-mono"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {h.filePath}
                  </span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {new Date(h.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-14 text-center">
            <Zap
              className="w-7 h-7 mx-auto mb-2"
              style={{ color: 'var(--border-strong)' }}
              strokeWidth={1.5}
            />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No hooks triggered yet
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
              Click &quot;Trigger Demo Hook&quot; or &quot;Scan Codebase&quot; above
            </p>
          </div>
        )}
      </div>

      {/* Doc previews */}
      {data?.architecture && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Architecture', content: data.architecture },
            { label: 'API Docs', content: data.apiDocs },
          ].map(({ label, content }) => (
            <div
              key={label}
              className="rounded-xl p-4"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <h3
                className="text-xs mb-2"
                style={{ fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
              >
                {label}
              </h3>
              <pre
                className="text-xs font-mono overflow-hidden leading-relaxed"
                style={{
                  color: 'var(--text-muted)',
                  display: '-webkit-box',
                  WebkitLineClamp: 6,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {content?.slice(0, 500)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
