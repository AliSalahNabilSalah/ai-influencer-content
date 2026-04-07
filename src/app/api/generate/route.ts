import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { researchBrand } from '@/lib/firecrawl';
import { scrapeInfluencerPosts } from '@/lib/apify';
import { transcribePosts } from '@/lib/whisper';
import { analyzeBrand, analyzeInfluencerStyle, generatePlatformContent } from '@/lib/openrouter';
import type { CampaignFormData, GenerationResult, Platform } from '@/types';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

function sendEvent(controller: ReadableStreamDefaultController, data: object) {
  const text = `data: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(text));
}

export async function POST(req: NextRequest) {
  const body: CampaignFormData = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // ── Create session record ────────────────────────────
        const session = await prisma.influencerSession.create({
          data: {
            name: body.name,
            brandName: body.brandName,
            brandUrl: body.brandUrl,
            brandSocials: JSON.stringify(body.brandSocials || []),
            platforms: JSON.stringify(body.platforms),
            influencer: JSON.stringify({ name: body.influencerName, accounts: body.influencerAccounts || { main: body.influencerAccount } }),
            campaignGoal: body.campaignGoal,
            contentStyle: body.contentStyle,
            mainMessage: body.mainMessage,
            notes: body.notes,
            status: 'processing',
          },
        });

        sendEvent(controller, { type: 'session', sessionId: session.id });
        sendEvent(controller, { type: 'progress', percent: 2, message: 'جاري بدء البحث عن البراند...' });

        // ── STEP 1: Brand Research ───────────────────────────
        sendEvent(controller, { type: 'progress', percent: 5, message: 'جاري تحليل موقع البراند...' });
        const brandResearch = await researchBrand(body.brandUrl);
        sendEvent(controller, { type: 'progress', percent: 12, message: 'جاري تحليل هوية البراند...' });

        const brandAnalysis = await analyzeBrand({
          brandName: body.brandName,
          brandUrl: body.brandUrl,
          websiteContent: brandResearch.websiteContent,
          socialPosts: brandResearch.socialPosts,
          campaignGoal: body.campaignGoal,
        });
        sendEvent(controller, { type: 'progress', percent: 20, message: 'اكتمل تحليل البراند ✓' });

        // ── STEP 2: Influencer Scraping & Analysis ───────────
        const platforms = body.platforms as Platform[];
        const influencerStyleMap: Record<string, string> = {};
        const totalPlatforms = platforms.length;
        const platformAccounts = (body.influencerAccounts || {}) as Record<string, string>;

        // Collect all scraped content across platforms for cross-platform fallback
        const allTranscripts: string[] = [];
        const allCaptions: string[] = [];

        for (let i = 0; i < platforms.length; i++) {
          const platform = platforms[i];
          const basePercent = 20 + (i / totalPlatforms) * 45;
          const accountUrl = platformAccounts[platform] || body.influencerAccount;

          sendEvent(controller, {
            type: 'progress',
            percent: Math.round(basePercent + 2),
            message: `جاري جلب منشورات ${body.influencerName} على ${platform}...`,
          });

          let posts = await scrapeInfluencerPosts(platform, accountUrl, 12);
          const noDataForPlatform = posts.length === 0;

          sendEvent(controller, {
            type: 'progress',
            percent: Math.round(basePercent + 8),
            message: noDataForPlatform
              ? `لا توجد بيانات لـ${platform} — سيتم الاستعانة بمنصات أخرى...`
              : `جاري استخراج نص الفيديوهات على ${platform}...`,
          });

          let transcripts: string[] = [];
          let captions: string[] = [];

          if (noDataForPlatform) {
            // Fallback: use content collected from other platforms already scraped
            transcripts = allTranscripts.slice(0, 8);
            captions = allCaptions.slice(0, 8);
          } else {
            transcripts = await transcribePosts(posts);
            captions = posts.map(p => p.caption || '');
            allTranscripts.push(...transcripts);
            allCaptions.push(...captions);
          }

          sendEvent(controller, {
            type: 'progress',
            percent: Math.round(basePercent + 14),
            message: `جاري تحليل أسلوب ${body.influencerName} على ${platform}...`,
          });

          const styleAnalysis = await analyzeInfluencerStyle({
            influencerName: body.influencerName,
            platform,
            transcripts,
            captions,
            noDirectData: noDataForPlatform,
          });

          influencerStyleMap[platform] = styleAnalysis;
        }

        sendEvent(controller, { type: 'progress', percent: 65, message: 'اكتمل تحليل الإنفلونسر ✓' });

        // ── STEP 3: Content Generation ───────────────────────
        const result: GenerationResult = {};

        for (let i = 0; i < platforms.length; i++) {
          const platform = platforms[i];
          const basePercent = 65 + (i / totalPlatforms) * 30;

          sendEvent(controller, {
            type: 'progress',
            percent: Math.round(basePercent + 3),
            message: `جاري كتابة محتوى ${platform} بأسلوب ${body.influencerName}...`,
          });

          const content = await generatePlatformContent({
            platform,
            influencerName: body.influencerName,
            influencerStyle: influencerStyleMap[platform],
            brandAnalysis,
            brandName: body.brandName,
            campaignGoal: body.campaignGoal,
            contentStyle: body.contentStyle,
            mainMessage: body.mainMessage,
            notes: body.notes,
          });

          result[platform] = content;
        }

        sendEvent(controller, { type: 'progress', percent: 95, message: 'اكتمل توليد المحتوى ✓ جاري تجهيز الملف...' });

        // ── STEP 4: Save Result ──────────────────────────────
        await prisma.influencerSession.update({
          where: { id: session.id },
          data: {
            status: 'done',
            result: JSON.stringify(result),
          },
        });

        sendEvent(controller, {
          type: 'progress',
          percent: 100,
          message: 'تم! محتوى الحملة جاهز.',
        });

        sendEvent(controller, {
          type: 'done',
          sessionId: session.id,
          result,
        });

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Generation pipeline error:', error);
        sendEvent(controller, { type: 'error', message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
