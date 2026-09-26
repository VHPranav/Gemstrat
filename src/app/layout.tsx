import type { Metadata } from 'next';
import SmoothScroll from '@/components/providers/SmoothScroll';
import ScrollToTop from '@/components/providers/ScrollToTop';
import Navbar from '@/components/navigation/Navbar';
import CookieNotice from '@/components/ui/CookieNotice';
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
        <link rel="preload" href="/fonts/PPFrama-Variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="font-sans">
        <ScrollToTop />
        <Navbar />
        <SmoothScroll />
        {children}
        <CookieNotice />
      </body>
    </html>
  );
}
