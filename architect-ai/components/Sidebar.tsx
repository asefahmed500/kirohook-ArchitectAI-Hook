'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, GitGraph, Activity, Zap } from 'lucide-react';

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/documentation', label: 'Docs', icon: FileText },
  { href: '/diagrams', label: 'Diagrams', icon: GitGraph },
  { href: '/activity', label: 'Activity', icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="w-56 flex flex-col flex-shrink-0"
      style={{
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div
        className="px-5 py-4 flex items-center gap-2.5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--accent)' }}
        >
          <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <div
            className="text-sm leading-tight"
            style={{ fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}
          >
            ArchitectAI
          </div>
          <div
            className="text-xs leading-tight mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Kiro Hook Engine
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2.5 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                fontWeight: active ? 500 : 400,
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                background: active ? 'var(--accent-subtle)' : 'transparent',
                letterSpacing: active ? '-0.01em' : 'normal',
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2 : 1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Hook status */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
          style={{ background: 'var(--green)' }}
        />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Hook active
        </span>
      </div>
    </aside>
  );
}
