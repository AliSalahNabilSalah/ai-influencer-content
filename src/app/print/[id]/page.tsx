import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { GenerationResult } from '@/types';

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'إنستجرام',
  tiktok: 'تيك توك',
  snapchat: 'سناب شات',
  youtube: 'يوتيوب',
  twitter: 'تويتر / X',
  facebook: 'فيسبوك',
};

const PLATFORM_COLORS: Record<string, { bg: string; light: string; text: string }> = {
  instagram: { bg: '#E1306C', light: '#FFF0F5', text: '#E1306C' },
  tiktok:    { bg: '#010101', light: '#F5F5F5', text: '#010101' },
  snapchat:  { bg: '#FFFC00', light: '#FFFDE7', text: '#5C5800' },
  youtube:   { bg: '#FF0000', light: '#FFF5F5', text: '#CC0000' },
  twitter:   { bg: '#1DA1F2', light: '#F0F8FF', text: '#1A8CD8' },
  facebook:  { bg: '#1877F2', light: '#F0F5FF', text: '#1877F2' },
};

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await prisma.influencerSession.findUnique({ where: { id } });

  if (!session || !session.result) notFound();

  const result: GenerationResult = JSON.parse(session.result);
  const influencer = typeof session.influencer === 'string'
    ? JSON.parse(session.influencer)
    : session.influencer;
  const influencerName = influencer?.name || '';

  const date = new Date(session.createdAt).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const platforms = Object.keys(result);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

        #print-root * { box-sizing: border-box; font-family: 'Cairo', sans-serif !important; }

        #print-root {
          background: #ffffff;
          color: #111827;
          direction: rtl;
          padding: 40px 48px;
        }

        .pr-header {
          padding-bottom: 24px;
          border-bottom: 2px solid #111827;
          margin-bottom: 32px;
        }
        .pr-title {
          font-size: 32px;
          font-weight: 900;
          color: #111827;
          margin-bottom: 16px;
          line-height: 1.3;
        }
        .pr-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .pr-chip {
          background: #F3F4F6;
          border-radius: 6px;
          padding: 6px 10px;
        }
        .pr-chip-label {
          font-size: 9px;
          font-weight: 700;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .pr-chip-value {
          font-size: 11px;
          font-weight: 600;
          color: #111827;
          margin-top: 2px;
        }

        .pr-platform {
          margin-bottom: 28px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #E5E7EB;
        }
        .pr-platform-header {
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .pr-platform-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          flex-shrink: 0;
        }
        .pr-platform-name {
          font-size: 16px;
          font-weight: 900;
          color: #ffffff;
        }
        .pr-platform-body {
          padding: 20px;
        }

        .pr-block {
          margin-bottom: 20px;
        }
        .pr-block-label {
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        .pr-block-box {
          background: #F9FAFB;
          border-radius: 6px;
          border: 1px solid #E5E7EB;
          padding: 14px;
        }
        .pr-block-text {
          font-size: 12px;
          color: #1F2937;
          line-height: 2;
          white-space: pre-wrap;
          direction: rtl;
          text-align: right;
        }

        .pr-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }
        .pr-tag {
          background: #EFF6FF;
          border-radius: 999px;
          padding: 4px 10px;
          border: 1px solid #BFDBFE;
          font-size: 10px;
          color: #1D4ED8;
          direction: ltr;
        }

        .pr-footer {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid #E5E7EB;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .pr-footer-text { font-size: 10px; color: #9CA3AF; }
        .pr-footer-brand { font-size: 10px; font-weight: 700; color: #111827; }
      `}</style>

      <div id="print-root">
        <div className="pr-header">
          <div className="pr-title">{session.name}</div>
          <div className="pr-meta-row">
            {[
              { label: 'البراند', value: session.brandName },
              { label: 'الإنفلونسر', value: influencerName },
              { label: 'الهدف', value: session.campaignGoal },
              { label: 'الأسلوب', value: session.contentStyle },
              { label: 'التاريخ', value: date },
              { label: 'المنصات', value: `${platforms.length}` },
            ].map(item => (
              <div key={item.label} className="pr-chip">
                <div className="pr-chip-label">{item.label}</div>
                <div className="pr-chip-value">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {platforms.map(platform => {
          const content = result[platform];
          const colors = PLATFORM_COLORS[platform] || { bg: '#111827', light: '#F9FAFB', text: '#111827' };
          const label = PLATFORM_LABELS[platform] || platform;

          return (
            <div key={platform} className="pr-platform">
              <div className="pr-platform-header" style={{ backgroundColor: colors.bg }}>
                <div className="pr-platform-dot" />
                <div className="pr-platform-name">{label}</div>
              </div>
              <div className="pr-platform-body" style={{ backgroundColor: colors.light }}>

                {content.script && (
                  <div className="pr-block">
                    <div className="pr-block-label" style={{ color: colors.text }}>السكريبت / محتوى الفيديو</div>
                    <div className="pr-block-box">
                      <div className="pr-block-text">{content.script}</div>
                    </div>
                  </div>
                )}

                <div className="pr-block">
                  <div className="pr-block-label" style={{ color: colors.text }}>الكابشن</div>
                  <div className="pr-block-box">
                    <div className="pr-block-text">{content.caption}</div>
                  </div>
                </div>

                {content.hashtags && content.hashtags.length > 0 && (
                  <div className="pr-block">
                    <div className="pr-block-label" style={{ color: colors.text }}>الهاشتاجات</div>
                    <div className="pr-tags">
                      {content.hashtags.map((tag, i) => (
                        <span key={i} className="pr-tag">
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="pr-footer">
          <span className="pr-footer-text">{session.name} — {date}</span>
          <span className="pr-footer-brand">Nojom AI Content Generator</span>
        </div>
      </div>
    </>
  );
}
