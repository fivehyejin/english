import type { Metadata } from 'next';

import { Header } from '@/components/Header';
import { Providers } from '@/components/providers';

import './globals.css';

export const metadata: Metadata = {
  title: 'English Learning Notebook',
  description: '영어 학습 정리 노트',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Providers>
          <Header />
          <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-screen-xl px-4 py-6 md:px-6 md:py-10 lg:px-8">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
