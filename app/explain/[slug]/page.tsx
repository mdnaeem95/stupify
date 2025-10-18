import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTopicBySlug, getRelatedTopics, getAllTopics } from '@/lib/topics/topics-db';
import { generatePageTitle, generateMetaDescription, generateStructuredData } from '@/lib/topics/types';
import { TopicLandingPage } from '@/components/seo/TopicLandingPage';

// Generate static params for all topics (for static generation)
export async function generateStaticParams() {
  const topics = getAllTopics();
  
  return topics.map((topic) => ({
    slug: topic.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const topic = getTopicBySlug(params.slug);
  
  if (!topic) {
    return {
      title: 'Topic Not Found | Stupify',
      description: 'The topic you\'re looking for doesn\'t exist.',
    };
  }

  const title = generatePageTitle(topic);
  const description = generateMetaDescription(topic);
  const structuredData = generateStructuredData(topic);

  return {
    title,
    description,
    keywords: topic.keywords,
    authors: [{ name: 'Stupify' }],
    
    // Open Graph
    openGraph: {
      title,
      description,
      url: `https://stupify.app/explain/${topic.slug}`,
      siteName: 'Stupify',
      type: 'article',
      images: [
        {
          url: `/og/${topic.slug}.png`, // We'll generate these
          width: 1200,
          height: 630,
          alt: `${topic.title} explained simply`,
        },
      ],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/og/${topic.slug}.png`],
      creator: '@stupify',
    },
    
    // Additional metadata
    alternates: {
      canonical: `https://stupify.app/explain/${topic.slug}`,
    },
    
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
    
    // Structured data (JSON-LD)
    other: {
      'application-ld+json': JSON.stringify(structuredData),
    },
  };
}

// Main page component
export default function ExplainTopicPage({ params }: { params: { slug: string } }) {
  const topic = getTopicBySlug(params.slug);
  
  if (!topic) {
    notFound();
  }
  
  const relatedTopics = getRelatedTopics(params.slug);
  
  return (
    <>
      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData(topic)),
        }}
      />
      
      {/* Main Content */}
      <TopicLandingPage topic={topic} relatedTopics={relatedTopics} />
    </>
  );
}