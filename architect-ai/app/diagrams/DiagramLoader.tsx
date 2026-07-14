'use client';
import dynamic from 'next/dynamic';
const DiagramClient = dynamic(() => import('./DiagramClient'), { ssr: false, loading: () => null });
export default function DiagramLoader() {
  return <DiagramClient />;
}
