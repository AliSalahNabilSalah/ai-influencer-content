export type Platform = 'instagram' | 'tiktok' | 'snapchat' | 'youtube' | 'twitter' | 'facebook';

export interface InfluencerAccounts {
  instagram?: string;
  tiktok?: string;
  snapchat?: string;
  youtube?: string;
  twitter?: string;
  facebook?: string;
}

export interface CampaignFormData {
  name: string;
  brandName: string;
  brandUrl: string;
  brandSocials: string[];
  platforms: Platform[];
  influencerName: string;
  influencerAccount: string; // primary account (first filled)
  influencerAccounts?: Record<string, string>; // platform → url
  campaignGoal: string;
  contentStyle: string;
  mainMessage: string;
  notes?: string;
}

export interface PlatformContent {
  script?: string;      // for video platforms
  caption: string;
  hashtags: string[];
  notes?: string;
}

export interface GenerationResult {
  [platform: string]: PlatformContent;
}

export interface SessionRecord {
  id: string;
  name: string;
  brandName: string;
  brandUrl: string;
  brandSocials: string[];
  platforms: Platform[];
  influencer: { name: string; accounts: InfluencerAccounts };
  campaignGoal: string;
  contentStyle: string;
  mainMessage: string;
  notes?: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  result?: GenerationResult;
  createdAt: Date;
}

export interface ProgressUpdate {
  step: number;
  total: number;
  percent: number;
  message: string;
  stage: 'brand' | 'influencer' | 'analysis' | 'generation' | 'pdf' | 'done' | 'error';
}
