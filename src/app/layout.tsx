import type { Metadata } from 'next';
import SmoothScroll from '@/components/providers/SmoothScroll';
import ScrollToTop from '@/components/providers/ScrollToTop';
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
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://use.typekit.net/tas3jji.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Besley:ital,wght@0,400..900;1,400..900&display=swap" />
      </head>
      <body className="font-sans">
        <ScrollToTop />
        {/* <Navbar /> */}
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
