'use client';

import dynamic from 'next/dynamic';

const Workspace = dynamic(
  () => import('../components/workspace/Workspace').then((mod) => mod.Workspace),
  { ssr: false }
);

export default function Home() {
  return <Workspace />;
}
