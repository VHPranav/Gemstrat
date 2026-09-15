import type { Metadata } from 'next';
import SmoothScroll from '@/components/providers/SmoothScroll';
import ScrollToTop from '@/components/providers/ScrollToTop';
import Loader from '@/components/ui/Loader';
import Navbar from '@/components/navigation/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gemstrat — Boutique Strategic Consultancy',
  description:
    'Boutique Strategic Consultancy across USA, Canada, India, Middle East, and Africa. Solving what matters, building what lasts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-mono">
        <ScrollToTop />
        <Loader />
        <Navbar />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
