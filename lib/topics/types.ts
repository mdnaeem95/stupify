// lib/topics/types.ts

export interface TopicExplanations {
  '5yo': string;
  normal: string;
  advanced: string;
}

export interface Topic {
  slug: string;
  title: string;
  metaDescription: string;
  category: 'Technology' | 'Science' | 'Business' | 'Finance' | 'Health' | 'Math' | 'Philosophy' | 'History';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  searchVolume?: number; // Monthly Google searches (optional)
  explanations: TopicExplanations;
  relatedTopics: string[]; // Slugs of related topics
  keywords: string[]; // SEO keywords
  lastUpdated: string; // ISO date
}

export interface TopicMetadata {
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  searchVolume?: number;
}

// Helper function to generate page title
export function generatePageTitle(topic: Topic): string {
  return `What is ${topic.title}? Explained Simply | STUPIFY`;
}

// Helper function to generate meta description
export function generateMetaDescription(topic: Topic): string {
  return topic.metaDescription || 
    `Understand ${topic.title.toLowerCase()} in seconds. Get simple explanations at 3 levels: 5-year-old, normal, or advanced. Free AI-powered learning.`;
}

// Helper function to get Open Graph image URL
export function getOgImageUrl(slug: string): string {
  return `/og/${slug}.png`; // We'll generate these later
}

// Helper function to generate structured data (Schema.org)
export function generateStructuredData(topic: Topic) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalArticle',
    headline: topic.title,
    description: topic.metaDescription,
    author: {
      '@type': 'Organization',
      name: 'STUPIFY',
      url: 'https://stupify.app'
    },
    publisher: {
      '@type': 'Organization',
      name: 'STUPIFY',
      logo: {
        '@type': 'ImageObject',
        url: 'https://stupify.app/logo.png'
      }
    },
    datePublished: topic.lastUpdated,
    dateModified: topic.lastUpdated,
    educationalLevel: topic.difficulty,
    keywords: topic.keywords.join(', '),
    inLanguage: 'en-US',
  };
}