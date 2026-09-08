import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import SmoothScroll from '@/components/providers/SmoothScroll';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

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
    <html lang="en" className={plusJakartaSans.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Archivo:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Work+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={plusJakartaSans.className}>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
