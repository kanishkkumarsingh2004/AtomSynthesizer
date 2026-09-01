import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SilenceThreeWarnings } from '../components/common/SilenceThreeWarnings';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'AtomSynthesizer — Interactive 3D Molecular Workspace',
  description: 'Interactive web-based molecular design and visualization platform. Build, inspect, analyze, and validate molecular structures in 3D.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${mono.variable} font-sans bg-slate-950 text-slate-100 overflow-hidden`}>
        <SilenceThreeWarnings />
        {children}
      </body>
    </html>
  );
}
