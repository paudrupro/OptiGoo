import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <nav className="mx-auto flex max-w-6xl gap-4 p-4 text-sm">
          <Link href="/" className="font-semibold">OptiGoo</Link>
          <Link href="/results">Résultats</Link>
          <Link href="/history">Historique</Link>
          <Link href="/settings">Scoring</Link>
          <Link href="/templates">Templates</Link>
        </nav>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
      </body>
    </html>
  );
}
