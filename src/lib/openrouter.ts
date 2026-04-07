const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

const MODELS = {
  brandAnalysis: 'google/gemini-2.5-pro-preview',
  influencerAnalysis: 'anthropic/claude-opus-4-5',
  contentGeneration: 'anthropic/claude-opus-4-5',
};

async function chat(model: string, messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AI Influencer Content Generator',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content || '';
}

// ─── Brand Analysis ────────────────────────────────────────────
export async function analyzeBrand(params: {
  brandName: string;
  brandUrl: string;
  websiteContent: string;
  socialPosts: string;
  campaignGoal: string;
}): Promise<string> {
  const prompt = `
You are a senior brand strategist. Analyze the following brand and provide a detailed brief.

Brand: ${params.brandName}
Website: ${params.brandUrl}
Campaign Goal: ${params.campaignGoal}

Website Content:
${params.websiteContent}

Social Media Content:
${params.socialPosts}

Provide a structured analysis covering:
1. Brand identity & positioning
2. Target audience
3. Brand tone & voice
4. Key products/services
5. Ad style patterns observed
6. Key messages that resonate with their audience

Keep the analysis concise but insightful. Use bullet points.
`;

  return chat(MODELS.brandAnalysis, [{ role: 'user', content: prompt }]);
}

// ─── Influencer Style Analysis ─────────────────────────────────
export async function analyzeInfluencerStyle(params: {
  influencerName: string;
  platform: string;
  transcripts: string[];
  captions: string[];
  noDirectData?: boolean;
}): Promise<string> {
  const contentSample = params.transcripts
    .concat(params.captions)
    .filter(Boolean)
    .slice(0, 10)
    .map((t, i) => `Post ${i + 1}:\n${t}`)
    .join('\n\n---\n\n');

  const platformNote = params.noDirectData
    ? `NOTE: No direct ${params.platform} content was available for this influencer. The content below is from their other social media platforms. Please infer how they would likely present themselves on ${params.platform} based on their general style, and adapt it to ${params.platform}'s format and culture.`
    : `Content is taken directly from their ${params.platform} account.`;

  const prompt = `
You are an expert content analyst specializing in influencer marketing.

Analyze the content style of influencer "${params.influencerName}" for use on ${params.platform}.

${platformNote}

Here are their recent posts/videos:

${contentSample || '(No content available — use general knowledge about this influencer if known, otherwise describe a typical style for their niche on this platform)'}

Provide a detailed style profile covering:
1. **Language & Dialect**: What language/dialect do they use? (e.g., Egyptian Arabic, Saudi Arabic, English)
2. **Tone**: Comedic, serious, casual, formal, inspirational, etc.
3. **Structure**: How do they start? How do they hook the audience? How do they end?
4. **Vocabulary**: Common words, phrases, expressions they use
5. **Energy Level**: High energy, calm, conversational, etc.
6. **Signature Elements**: Catchphrases, recurring patterns, unique style elements
7. **Ad Integration Style**: How do they typically integrate brand mentions? Natural, direct, storytelling?
8. **${params.platform} Adaptation**: Specific notes on how this style should be adapted for ${params.platform}'s format

This analysis will be used to write ad content IN THEIR EXACT STYLE for ${params.platform}. Be very specific.
`;

  return chat(MODELS.influencerAnalysis, [{ role: 'user', content: prompt }]);
}

// ─── Content Generation ────────────────────────────────────────
export async function generatePlatformContent(params: {
  platform: string;
  influencerName: string;
  influencerStyle: string;
  brandAnalysis: string;
  brandName: string;
  campaignGoal: string;
  contentStyle: string;
  mainMessage: string;
  notes?: string;
}): Promise<{ script?: string; caption: string; hashtags: string[] }> {
  const platformGuidelines: Record<string, string> = {
    instagram: 'Instagram post/reel — can include both caption and short script for reel. Caption max 2200 chars. Use line breaks for readability.',
    tiktok: 'TikTok video script — conversational, fast-paced, hook in first 3 seconds. Include on-screen text suggestions.',
    snapchat: 'Snapchat story/spotlight — very short, direct, casual. Usually 15-60 seconds.',
    youtube: 'YouTube integration script — can be longer, more detailed. Include natural transition to/from main content.',
    twitter: 'Twitter/X post — max 280 chars. Punchy and direct.',
    facebook: 'Facebook post — can be longer, storytelling format works well.',
  };

  const prompt = `
You are a professional content writer specializing in influencer advertising. Your job is to write ad content that sounds EXACTLY like the influencer wrote it themselves.

## Influencer: ${params.influencerName}
## Platform: ${params.platform}
## Platform Guidelines: ${platformGuidelines[params.platform] || params.platform}

## Influencer Style Profile:
${params.influencerStyle}

## Brand Analysis:
${params.brandAnalysis}

## Campaign Details:
- Brand: ${params.brandName}
- Campaign Goal: ${params.campaignGoal}
- Content Style: ${params.contentStyle}
- Main Message: ${params.mainMessage}
${params.notes ? `- Additional Notes: ${params.notes}` : ''}

## Your Task:
Write ad content for ${params.platform} that:
1. Sounds EXACTLY like ${params.influencerName} — same dialect, same tone, same vocabulary, same energy
2. Naturally integrates the brand message
3. Follows ${params.platform} best practices
4. Achieves the campaign goal: ${params.campaignGoal}

Respond in this exact JSON format:
{
  "script": "Full video script if applicable (null for text-only platforms)",
  "caption": "Post caption / text",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}

IMPORTANT: Write in the influencer's actual language and dialect. Do NOT translate to English if they speak Arabic.
`;

  const response = await chat(MODELS.contentGeneration, [{ role: 'user', content: prompt }]);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // fallback
  }

  return {
    caption: response,
    hashtags: [],
  };
}
