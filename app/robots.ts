// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://stupify.app';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // Don't crawl API routes
          '/admin/',         // Don't crawl admin (if you add one)
          '/*?*apiKey=*',    // Don't crawl URLs with API keys
          '/*?*token=*',     // Don't crawl URLs with tokens
        ],
      },
      {
        userAgent: 'GPTBot',  // OpenAI's web crawler
        disallow: '/',        // Optional: Block AI training crawlers
      },
      {
        userAgent: 'CCBot',   // Common Crawl bot (used for AI training)
        disallow: '/',        // Optional: Block AI training crawlers
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}