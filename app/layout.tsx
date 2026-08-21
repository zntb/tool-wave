import type { Metadata, Viewport } from 'next';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header } from '@/components/header';
import { JsonLd } from '@/components/json-ld';
import { cn } from '@/lib/utils';
import { Geist_Mono } from 'next/font/google';
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { BackToTop } from '@/components/back-to-top';

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Tool Wave',
  description:
    'A curated collection of design resources for developers - UI graphics, fonts, colors, icons, and more.',
  url: 'https://tool-wave.vercel.app',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://tool-wave.vercel.app/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export const metadata: Metadata = {
  metadataBase: new URL('https://tool-wave.vercel.app'),
  title: {
    default: 'Tool Wave',
    template: '%s | Tool Wave',
  },
  description:
    'A curated collection of design resources for developers - UI graphics, fonts, colors, icons, and more.',
  keywords: [
    'design resources',
    'UI graphics',
    'fonts',
    'icons',
    'colors',
    'web design',
    'developer tools',
  ],
  authors: [{ name: 'Design Resources' }],
  openGraph: {
    title: 'Tool Wave',
    description:
      'A curated collection of design resources for developers - UI graphics, fonts, colors, icons, and more.',
    type: 'website',
    url: '/',
    siteName: 'Tool Wave',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tool Wave',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tool Wave',
    description:
      'A curated collection of design resources for developers - UI graphics, fonts, colors, icons, and more.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://tool-wave.vercel.app',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: [
    {
      media: '(prefers-color-scheme: light)',
      color: '#0ea5e9',
    },
    {
      media: '(prefers-color-scheme: dark)',
      color: '#0284c7',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background text-foreground antialiased',
          geistMono.variable,
        )}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          {/* Atmospheric background effects */}
          <div className='atmosphere' aria-hidden='true' />
          <div className='noise-overlay' aria-hidden='true' />            <JsonLd data={jsonLd} />

            {/* Skip to main content — first focusable element for keyboard/screen reader users */}
            <a
              href='#main-content'
              className='sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-cyan-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg focus:outline-none'
            >
              Skip to main content
            </a>

            <TooltipProvider delayDuration={100} skipDelayDuration={50}>
              <Suspense fallback={null}>
                <Header />
              </Suspense>
              <main id='main-content' className='relative'>
              <Suspense fallback={null}>{children}</Suspense>
            </main>
            <Toaster position='top-right' richColors />
            <BackToTop />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
