import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

// Content Security Policy
// - 'unsafe-inline' required for scripts/styles (Next.js hydration, React, CSS-in-JS)
// - 'unsafe-eval' only in development (React dev mode error overlays)
// - Google Fonts: fonts.googleapis.com (CSS) and fonts.gstatic.com (woff2 files)
// - Remote images: any HTTPS origin (next/image with remotePatterns)
const cspHeader = [
  "default-src 'self'",
  // Scripts: self + unsafe-inline (required by Next.js/React)
  // In dev, unsafe-eval is needed for React error overlays
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  // Styles: self + unsafe-inline (required by Tailwind, CSS-in-JS, next-themes)
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  // Images: self, data URIs, blob URIs, and any HTTPS origin (for remote resource icons)
  "img-src 'self' data: blob: https:",
  // Fonts: self + Google Fonts
  "font-src 'self' https://fonts.gstatic.com data:",
  // Connect: self + Google Fonts (for font CSS fetches)
  "connect-src 'self' https://fonts.googleapis.com",
  // No plugins/objects
  "object-src 'none'",
  // Restrict base tag to self
  "base-uri 'self'",
  // Forms only submit to self
  "form-action 'self'",
  // Prevent framing (clickjacking protection)
  "frame-ancestors 'none'",
  // Upgrade HTTP to HTTPS
  'upgrade-insecure-requests',
]
  .join('; ')
  .trim();

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: cspHeader,
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

/** @type {NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
