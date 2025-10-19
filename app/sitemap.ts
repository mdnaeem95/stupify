import { MetadataRoute } from 'next';
import { getAllTopics } from '@/lib/topics/topics-db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://stupify.app';
  
  // Get current date for lastModified
  const currentDate = new Date();

  // ⭐ Fetch all topics from database
  const topics = await getAllTopics();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explain`,
      lastModified: currentDate,
      changeFrequency: 'daily', // Updates when new topics added
      priority: 0.9, // High priority - main content hub
    },
    {
      url: `${baseUrl}/chat`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9, // High priority - main product
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // ⭐ Dynamic topic pages
  const topicPages: MetadataRoute.Sitemap = topics.map((topic) => ({
    url: `${baseUrl}/explain/${topic.slug}`,
    lastModified: topic.lastUpdated ? new Date(topic.lastUpdated) : currentDate,
    changeFrequency: 'monthly' as const, // Topics don't change often once created
    priority: calculateTopicPriority(topic),
  }));

  // Combine and return
  return [...staticPages, ...topicPages];
}

// Helper function to calculate priority based on topic metrics
function calculateTopicPriority(topic: any): number {
  // Base priority for topic pages
  let priority = 0.7;
  
  // Boost priority for high search volume topics
  if (topic.searchVolume) {
    if (topic.searchVolume > 100000) {
      priority = 0.9; // Very popular topics
    } else if (topic.searchVolume > 50000) {
      priority = 0.85; // Popular topics
    } else if (topic.searchVolume > 10000) {
      priority = 0.8; // Moderately popular
    }
  }
  
  // Boost for high view count (actual traffic)
  if (topic.viewCount && topic.viewCount > 1000) {
    priority = Math.min(1.0, priority + 0.05);
  }
  
  return Math.round(priority * 10) / 10; // Round to 1 decimal
}