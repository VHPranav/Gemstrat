import type { Metadata } from 'next';
import SmoothScroll from '@/components/providers/SmoothScroll';
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
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100,400;100,500;100,600;100,700;100,800;100,900;125,400;125,500;125,600;125,700;125,800&family=JetBrains+Mono:wght@400;500;600&family=Work+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-archivo">
        <Loader />
        <Navbar />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
