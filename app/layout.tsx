import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
});

export const metadata = {
  title: 'Dr.Amira Attia', // هنا العنوان زي ما هو
  description: 'احجز جلستك العلاجية بسهولة', // الوصف اللي موجود

  openGraph: {
    url: 'https://dr-amira-attia.vercel.app',
    images: [
      {
        url: '/assets/social-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    images: ['/assets/social-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body className="font-sans antialiased bg-gray-50 text-gray-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
