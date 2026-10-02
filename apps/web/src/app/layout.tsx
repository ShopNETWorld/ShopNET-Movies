import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShopNET Movies — AI Studio for Nigerian & American Cinema',
  description: 'AI-assisted screenwriting, multi-modal generation, video extension, voice acting, and multi-platform social distribution.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/30">
        {children}
      </body>
    </html>
  );
}
