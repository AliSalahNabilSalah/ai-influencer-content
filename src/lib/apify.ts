import { ApifyClient } from 'apify-client';
import type { Platform } from '@/types';

const client = new ApifyClient({ token: process.env.APIFY_API_KEY });

export interface SocialPost {
  platform: Platform;
  type: 'video' | 'image' | 'text' | 'carousel';
  url?: string;
  caption?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  likes?: number;
  comments?: number;
  views?: number;
}

// Actor IDs for each platform
const ACTORS: Record<string, string> = {
  instagram: 'apify/instagram-scraper',
  tiktok: 'clockworks/free-tiktok-scraper',
  youtube: 'streamers/youtube-scraper',
  snapchat: 'apify/snapchat-scraper',
  twitter: 'quacker/twitter-scraper',
  facebook: 'apify/facebook-pages-scraper',
};

export async function scrapeInfluencerPosts(
  platform: Platform,
  profileUrl: string,
  limit = 12
): Promise<SocialPost[]> {
  const actorId = ACTORS[platform];
  if (!actorId) return [];

  try {
    let input: Record<string, unknown> = {};

    switch (platform) {
      case 'instagram':
        input = {
          directUrls: [profileUrl],
          resultsType: 'posts',
          resultsLimit: limit,
          addParentData: false,
        };
        break;
      case 'tiktok':
        input = {
          profiles: [profileUrl],
          resultsPerPage: limit,
          shouldDownloadVideos: false,
          shouldDownloadCovers: false,
        };
        break;
      case 'youtube':
        input = {
          startUrls: [{ url: profileUrl }],
          maxResults: limit,
          type: 'VIDEOS',
        };
        break;
      case 'snapchat':
        input = {
          username: extractUsername(profileUrl),
          maxItems: limit,
        };
        break;
      default:
        input = { startUrls: [{ url: profileUrl }], maxItems: limit };
    }

    const run = await client.actor(actorId).call(input, { waitSecs: 120 });
    const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit });

    return items.map((item: Record<string, unknown>) => normalizePlatformPost(platform, item));
  } catch (err) {
    console.error(`Apify ${platform} error:`, err);
    return [];
  }
}

function normalizePlatformPost(platform: Platform, item: Record<string, unknown>): SocialPost {
  switch (platform) {
    case 'instagram':
      return {
        platform,
        type: item.type === 'Video' ? 'video' : item.type === 'Sidecar' ? 'carousel' : 'image',
        url: item.url as string,
        caption: item.caption as string,
        videoUrl: item.videoUrl as string,
        likes: item.likesCount as number,
        comments: item.commentsCount as number,
        views: item.videoViewCount as number,
      };
    case 'tiktok':
      return {
        platform,
        type: 'video',
        url: item.webVideoUrl as string,
        caption: item.text as string,
        videoUrl: item.videoMeta ? (item.videoMeta as Record<string, unknown>).downloadAddr as string : undefined,
        likes: item.diggCount as number,
        comments: item.commentCount as number,
        views: item.playCount as number,
      };
    case 'youtube':
      return {
        platform,
        type: 'video',
        url: item.url as string,
        caption: item.title as string,
        videoUrl: item.url as string,
        views: item.viewCount as number,
      };
    default:
      return {
        platform,
        type: 'text',
        url: item.url as string,
        caption: item.text as string || item.caption as string,
      };
  }
}

function extractUsername(url: string): string {
  return url.split('/').filter(Boolean).pop() || url;
}
