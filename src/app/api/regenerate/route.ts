import { prisma } from '@/lib/db';
import { generatePlatformContent } from '@/lib/openrouter';

export const maxDuration = 120;

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'إنستجرام',
  tiktok: 'تيك توك',
  snapchat: 'سناب شات',
  youtube: 'يوتيوب',
  twitter: 'تويتر / X',
  facebook: 'فيسبوك',
};

export async function POST(req: Request) {
  const { sessionId, platforms, notes } = await req.json() as {
    sessionId: string;
    platforms: string[] | 'all';
    notes?: string;
  };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const session = await prisma.influencerSession.findUnique({ where: { id: sessionId } });
        if (!session || !session.result) {
          send({ type: 'error', message: 'الجلسة غير موجودة' });
          controller.close();
          return;
        }

        const currentResult = JSON.parse(session.result);
        const influencer = typeof session.influencer === 'string'
          ? JSON.parse(session.influencer)
          : session.influencer;

        const platformsToRegen: string[] = platforms === 'all'
          ? Object.keys(currentResult)
          : platforms;

        const total = platformsToRegen.length;
        const newResult = { ...currentResult };

        send({ type: 'progress', percent: 5, message: 'جاري التحضير...' });

        for (let i = 0; i < platformsToRegen.length; i++) {
          const platform = platformsToRegen[i];
          const label = PLATFORM_LABELS[platform] || platform;
          const progressStart = 10 + Math.round((i / total) * 80);

          send({ type: 'progress', percent: progressStart, message: `جاري إعادة إنشاء محتوى ${label}...` });

          // Build brand context from session data
          const brandAnalysis = `
Brand: ${session.brandName}
Website: ${session.brandUrl}
Campaign Goal: ${session.campaignGoal}
Content Style: ${session.contentStyle}
Main Message: ${session.mainMessage}
${session.notes ? `Campaign Notes: ${session.notes}` : ''}
          `.trim();

          // Use existing content as influencer style reference
          const existingContent = currentResult[platform];
          const styleReference = existingContent
            ? `\n\nREFERENCE (previously generated content in their style — use this as a style guide):\nCaption example:\n${existingContent.caption}`
            : '';

          const influencerStyle = `
Use the same dialect, tone, vocabulary, and energy as in the previous content for this influencer.
Keep the same authentic style — do NOT change the language or dialect.${styleReference}
          `.trim();

          const content = await generatePlatformContent({
            platform,
            influencerName: influencer.name,
            influencerStyle,
            brandAnalysis,
            brandName: session.brandName,
            campaignGoal: session.campaignGoal,
            contentStyle: session.contentStyle,
            mainMessage: session.mainMessage,
            notes: notes || undefined,
          });

          newResult[platform] = content;

          send({
            type: 'progress',
            percent: progressStart + Math.round(80 / total),
            message: `✓ تم إنشاء محتوى ${label}`,
          });
        }

        send({ type: 'progress', percent: 95, message: 'جاري الحفظ...' });

        await prisma.influencerSession.update({
          where: { id: sessionId },
          data: { result: JSON.stringify(newResult) },
        });

        send({ type: 'done', result: newResult });
      } catch (err) {
        send({ type: 'error', message: err instanceof Error ? err.message : 'خطأ في إعادة الإنشاء' });
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
