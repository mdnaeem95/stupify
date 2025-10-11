import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO Metadata Configuration
export const metadata: Metadata = {
  // Basic Metadata
  title: {
    default: "Stupify - AI That Speaks Human | Simple Explanations for Everything",
    template: "%s | Stupify"
  },
  description: "Finally, an AI that explains things simply. Get clear, jargon-free answers to any question. Choose from 3 simplicity levels: 5-year-old, normal person, or advanced. 10 free questions daily!",
  
  // Keywords for SEO
  keywords: [
    "AI explanation tool",
    "simple AI",
    "explain like I'm 5",
    "ELI5 AI",
    "AI tutor",
    "learn anything",
    "simple explanations",
    "AI chatbot",
    "educational AI",
    "question answering AI",
    "ChatGPT alternative",
    "AI for everyone",
    "simple learning",
    "AI simplified"
  ],

  // Authors
  authors: [{ name: "Stupify" }],
  
  // Creator
  creator: "Stupify",
  
  // Publisher
  publisher: "Stupify",

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://stupify-brown.vercel.app',
    siteName: 'Stupify',
    title: 'Stupify - AI That Speaks Human',
    description: 'Finally, an AI that explains things simply. No jargon, no confusion. Just clear explanations that make sense.',
    images: [
      {
        url: 'https://stupify-brown.vercel.app/og-image.png', // You'll create this
        width: 1200,
        height: 630,
        alt: 'Stupify - AI That Speaks Human',
      }
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Stupify - AI That Speaks Human',
    description: 'Finally, an AI that explains things simply. No jargon, no confusion. Just clear explanations.',
    images: ['https://stupify-brown.vercel.app/og-image.png'],
    creator: '@stupify', // Add your Twitter handle if you have one
  },

  // Icons
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
      },
    ],
  },

  // Manifest
  manifest: '/site.webmanifest',

  // Additional Metadata
  metadataBase: new URL('https://stupify-brown.vercel.app'),
  alternates: {
    canonical: 'https://stupify-brown.vercel.app',
  },

  // Verification (add these when you set them up)
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },

  // Category
  category: 'technology',

  // Other
  other: {
    'application-name': 'Stupify',
  },
};

// Viewport configuration
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Additional meta tags that can't be set in metadata object */}
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        
        {/* JSON-LD Structured Data for Rich Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Stupify",
              "description": "AI-powered question-answering service that explains complex topics in simple, accessible language",
              "url": "https://stupify-brown.vercel.app",
              "applicationCategory": "EducationalApplication",
              "offers": {
                "@type": "Offer",
                "price": "4.99",
                "priceCurrency": "USD",
                "priceSpecification": {
                  "@type": "UnitPriceSpecification",
                  "price": "4.99",
                  "priceCurrency": "USD",
                  "billingDuration": "P1M"
                }
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5",
                "ratingCount": "1"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}