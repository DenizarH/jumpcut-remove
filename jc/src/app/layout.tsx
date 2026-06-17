import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JumpCut Remove — Free Silence Remover for Video & Audio',
  description: 'Free online tool to automatically remove silences and dead air from videos and podcasts. No upload, no account, no watermark. Works in your browser using FFmpeg WASM.',
  keywords: 'remove silence from video, silence remover, auto jump cut, podcast editor, dead air remover, FFmpeg browser, free video editor',
  openGraph: {
    title: 'JumpCut Remove — Free Silence Remover',
    description: 'Automatically remove silences from videos and podcasts. Free, private, runs in your browser.',
    type: 'website',
    url: 'https://jumpcut-remove.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JumpCut Remove — Free Silence Remover',
    description: 'Automatically remove silences from videos and podcasts. Free, no upload, runs in your browser.',
  },
  robots: 'index, follow',
  alternates: { canonical: 'https://jumpcut-remove.vercel.app' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#c8f04a" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
