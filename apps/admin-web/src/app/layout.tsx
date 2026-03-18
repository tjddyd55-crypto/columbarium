import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: '납골당 플랫폼 관리자',
  description: '업체/슈퍼관리자 대시보드',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
