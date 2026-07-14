import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ArchitectAI — Auto Documentation',
  description: 'Automatically maintain docs, diagrams, and changelogs via Kiro Hooks',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}
        className="min-h-screen"
      >
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main
            className="flex-1 overflow-auto p-7"
            style={{ background: 'var(--bg)' }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
