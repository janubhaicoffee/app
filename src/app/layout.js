import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import InterceptorModal from '@/components/InterceptorModal';
import RegisterSW from '@/components/RegisterSW';
import { SkipToContent } from '@/components/SkipToContent';
import { WebVitals } from '@/components/WebVitals';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { headers } from 'next/headers';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#1a1a1a',
};

export const metadata = {
  title: {
    default: 'Janu Bhai Coffee | Premium Instant Coffee from Chikmagalur',
    template: '%s | Janu Bhai Coffee',
  },
  description:
    'Artisan roasted, single-estate instant coffee powder from Chikmagalur, Karnataka. Micro-crystallized to dissolve in 3 seconds in hot or cold milk with rich crema and zero bitterness. Delivered PAN India.',
  keywords: [
    'buy instant coffee online India',
    'Chikmagalur instant coffee',
    'premium instant coffee powder',
    'freeze dried instant coffee',
    'Janu Bhai Coffee',
    'best instant coffee India',
    'fresh roasted coffee PAN India',
  ],
  authors: [{ name: 'Janu Bhai Coffee' }],
  creator: 'Janu Bhai Coffee',
  metadataBase: new URL('https://janubhai.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://janubhai.com',
    title: 'Janu Bhai Coffee | Premium Instant Coffee from Chikmagalur',
    description:
      'Artisan roasted single-estate instant coffee powder from Chikmagalur. Dissolves in 3s in hot or cold milk. Order online PAN India.',
    siteName: 'Janu Bhai Coffee',
    images: [
      {
        url: 'https://janubhai.com/arsalanazad.png',
        width: 1200,
        height: 630,
        alt: 'Janu Bhai Coffee - Born in the hills. Brewed for you.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Janu Bhai Coffee',
    description: 'Authentic, small-batch roasted Chikmagalur coffee. Retail & wholesale.',
    images: ['https://janubhai.com/arsalanazad.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  alternates: {
    canonical: '/',
  },
};

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const isSubdomain =
    host.startsWith('admin.') || host.startsWith('outlet.') || host.startsWith('pos.');

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Janu Bhai Coffee',
      'url': 'https://janubhai.com',
      'logo': 'https://janubhai.com/icon.png',
      'description':
        'Authentic, small-batch roasted coffee from the hills of Chikmagaluru. Available for retail and commercial wholesale.',
      'sameAs': ['https://www.instagram.com/janubhaicoffee', 'https://twitter.com/janubhaicoffee'],
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Ground Floor, Shop 16, Building A1, Gafoor Nagar Dhalan, Jamia Nagar',
        'addressLocality': 'New Delhi',
        'addressRegion': 'Delhi',
        'postalCode': '110025',
        'addressCountry': 'IN',
      },
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+91-8527976791',
        'contactType': 'customer service',
        'availableLanguage': ['English', 'Hindi'],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'Janu Bhai Coffee',
      'url': 'https://janubhai.com',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': 'https://janubhai.com/?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${playfair.variable} ${inter.variable}`}>
        <SkipToContent />
        <WebVitals />
        <RegisterSW />
        <Toaster
          position="top-center"
          toastOptions={{
            style: { minHeight: '44px', fontSize: '14px' },
          }}
        />
        <ErrorBoundary>
          <AuthProvider>
            <CartProvider>
              {!isSubdomain && <TopBar />}
              <main id="main-content" role="main" tabIndex={-1}>
                <InterceptorModal />
                {children}
              </main>
              {!isSubdomain && <Footer />}
            </CartProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
