import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JournalForge',
  description: 'FoundryVTT Journal Editor',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="dark">
      <body className="bg-forge-bg text-forge-text h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
