import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { GenerationResult } from '@/types';

// Inline SVG icons for PDF (no external dependencies)
function PdfPlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'instagram':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.8" fill="white" stroke="none" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
        </svg>
      );
    case 'snapchat':
      return <img src="/icons/snapchat.png" width="16" height="16" alt="snapchat" style={{ borderRadius: 3 }} />;
    case 'youtube':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24">
          <rect x="2" y="5" width="20" height="14" rx="3" fill="white" />
          <polygon points="10,9 10,15 16,12" fill="#FF0000" />
        </svg>
      );
    case 'twitter':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    default:
      return <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />;
  }
}

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
      <div id="print-root" style={{ background: '#ffffff', color: '#111827', direction: 'rtl', padding: '40px 48px', fontFamily: 'Cairo, sans-serif' }}>
        <div style={{ paddingBottom: 24, borderBottom: '2px solid #111827', marginBottom: 32 }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#111827', marginBottom: 16, lineHeight: 1.3 }}>{session.name}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
            {[
              { label: 'البراند', value: session.brandName },
              { label: 'الإنفلونسر', value: influencerName },
              { label: 'الهدف', value: session.campaignGoal },
              { label: 'الأسلوب', value: session.contentStyle },
              { label: 'التاريخ', value: date },
              { label: 'المنصات', value: `${platforms.length}` },
            ].map(item => (
              <div key={item.label} style={{ background: '#F3F4F6', borderRadius: 6, padding: '6px 10px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{item.label}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#111827', marginTop: 2 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {platforms.map(platform => {
          const content = result[platform];
          const colors = PLATFORM_COLORS[platform] || { bg: '#111827', light: '#F9FAFB', text: '#111827' };
          const label = PLATFORM_LABELS[platform] || platform;

          return (
            <div key={platform} style={{ marginBottom: 28, borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
              <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, backgroundColor: colors.bg }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <PdfPlatformIcon platform={platform} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#ffffff' }}>{label}</div>
              </div>
              <div style={{ padding: 20, backgroundColor: colors.light }}>

                {content.script && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 8, color: colors.text }}>السكريبت / محتوى الفيديو</div>
                    <div style={{ background: '#F9FAFB', borderRadius: 6, border: '1px solid #E5E7EB', padding: 14 }}>
                      <div style={{ fontSize: 12, color: '#1F2937', lineHeight: 2, whiteSpace: 'pre-wrap', direction: 'rtl', textAlign: 'right' as const }}>{content.script}</div>
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 8, color: colors.text }}>الكابشن</div>
                  <div style={{ background: '#F9FAFB', borderRadius: 6, border: '1px solid #E5E7EB', padding: 14 }}>
                    <div style={{ fontSize: 12, color: '#1F2937', lineHeight: 2, whiteSpace: 'pre-wrap', direction: 'rtl', textAlign: 'right' as const }}>{content.caption}</div>
                  </div>
                </div>

                {content.hashtags && content.hashtags.length > 0 && (
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 8, color: colors.text }}>الهاشتاجات</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 4 }}>
                      {content.hashtags.map((tag, i) => (
                        <span key={i} style={{ background: '#EFF6FF', borderRadius: 999, padding: '4px 10px', border: '1px solid #BFDBFE', fontSize: 10, color: '#1D4ED8', direction: 'ltr' }}>
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

        <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#9CA3AF' }}>{session.name} — {date}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#111827' }}>Nojom AI Content Generator</span>
        </div>
      </div>
    </>
  );
}
