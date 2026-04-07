import React from 'react';
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import path from 'path';
import type { GenerationResult } from '@/types';

// Register Cairo TTF font (full Arabic + Latin coverage)
Font.register({
  family: 'Cairo',
  fonts: [
    { src: path.join(process.cwd(), 'public/fonts/Cairo-Regular.ttf'), fontWeight: 'normal' },
    { src: path.join(process.cwd(), 'public/fonts/Cairo-Bold.ttf'), fontWeight: 'bold' },
  ],
});

// Disable hyphenation
Font.registerHyphenationCallback(word => [word]);

// Strip emojis and unsupported characters that break PDF rendering
function sanitize(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')   // emoji ranges
    .replace(/[\u{2600}-\u{26FF}]/gu, '')       // misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')       // dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')       // variation selectors
    .replace(/[^\S\n]+/g, ' ')                  // collapse spaces but keep newlines
    .trim();
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'إنستجرام',
  tiktok: 'تيك توك',
  snapchat: 'سناب شات',
  youtube: 'يوتيوب',
  twitter: 'تويتر / X',
  facebook: 'فيسبوك',
};

const PLATFORM_ACCENT: Record<string, string> = {
  instagram: '#E1306C',
  tiktok:    '#010101',
  snapchat:  '#FFFC00',
  youtube:   '#FF0000',
  twitter:   '#1DA1F2',
  facebook:  '#1877F2',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Cairo',
    backgroundColor: '#FAFAFA',
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    direction: 'rtl',
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#111827',
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Cairo', fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'right',
    direction: 'rtl',
  },
  headerMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  metaChipLabel: {
    fontSize: 8,
    color: '#6B7280',
    fontFamily: 'Cairo', fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaChipValue: {
    fontSize: 9,
    color: '#111827',
    fontFamily: 'Cairo',
    marginTop: 1,
  },

  // ── Platform Section ─────────────────────────────────────
  platformSection: {
    marginBottom: 28,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  platformHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  platformName: {
    fontSize: 13,
    fontFamily: 'Cairo', fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  platformBody: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },

  // ── Content Blocks ───────────────────────────────────────
  contentBlock: {
    marginBottom: 16,
  },
  blockLabel: {
    fontSize: 7,
    fontFamily: 'Cairo', fontWeight: 'bold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  blockBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  blockText: {
    fontSize: 10,
    color: '#1F2937',
    lineHeight: 1.7,
    fontFamily: 'Cairo',
    textAlign: 'right',
    direction: 'rtl',
  },

  // ── Hashtags ─────────────────────────────────────────────
  hashtagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 4,
  },
  hashtag: {
    backgroundColor: '#EFF6FF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  hashtagText: {
    fontSize: 8,
    color: '#1D4ED8',
    fontFamily: 'Cairo',
  },

  // ── Footer ───────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
    fontFamily: 'Cairo',
  },
  footerBrand: {
    fontSize: 8,
    color: '#111827',
    fontFamily: 'Cairo', fontWeight: 'bold',
  },
});

interface PdfParams {
  sessionName: string;
  brandName: string;
  influencerName: string;
  campaignGoal: string;
  contentStyle: string;
  result: GenerationResult;
  createdAt?: Date;
}

function PdfDocument({ sessionName, brandName, influencerName, campaignGoal, contentStyle, result, createdAt }: PdfParams) {
  const date = createdAt
    ? new Date(createdAt).toLocaleDateString('ar-EG')
    : new Date().toLocaleDateString('ar-EG');

  const platforms = Object.keys(result);

  return (
    <Document title={sessionName} author="Nojom AI">

      {/* ── Cover Page ───────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{sessionName}</Text>
          <View style={styles.headerMeta}>
            {[
              { label: 'Brand', value: sanitize(brandName) },
              { label: 'Influencer', value: sanitize(influencerName) },
              { label: 'Goal', value: sanitize(campaignGoal) },
              { label: 'Style', value: sanitize(contentStyle) },
              { label: 'Date', value: date },
              { label: 'Platforms', value: platforms.length.toString() },
            ].map(item => (
              <View key={item.label} style={styles.metaChip}>
                <Text style={styles.metaChipLabel}>{item.label}</Text>
                <Text style={styles.metaChipValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Table of contents */}
        {platforms.map((platform, idx) => (
          <View key={platform} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: PLATFORM_ACCENT[platform] || '#111827', marginLeft: 8 }} />
            <Text style={{ fontFamily: 'Cairo', fontSize: 11, color: '#374151' }}>
              {idx + 1}. {PLATFORM_LABELS[platform] || platform}
            </Text>
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{sessionName}</Text>
          <Text style={styles.footerBrand}>Nojom AI Content Generator</Text>
        </View>
      </Page>

      {/* ── One Page Per Platform ─────────────────── */}
      {platforms.map(platform => {
        const content = result[platform];
        const accent = PLATFORM_ACCENT[platform] || '#111827';
        const label = PLATFORM_LABELS[platform] || platform;

        return (
          <Page key={platform} size="A4" style={styles.page}>
            {/* Platform Header */}
            <View style={[styles.platformSection]}>
              <View style={[styles.platformHeader, { backgroundColor: accent }]}>
                <View style={[styles.platformDot, { backgroundColor: '#ffffff' }]} />
                <Text style={styles.platformName}>{label}</Text>
              </View>

              <View style={styles.platformBody}>
                {/* Script */}
                {content.script && (
                  <View style={styles.contentBlock}>
                    <Text style={styles.blockLabel}>السكريبت / محتوى الفيديو</Text>
                    <View style={styles.blockBox}>
                      <Text style={styles.blockText}>{sanitize(content.script)}</Text>
                    </View>
                  </View>
                )}

                {/* Caption */}
                <View style={styles.contentBlock}>
                  <Text style={styles.blockLabel}>الكابشن</Text>
                  <View style={styles.blockBox}>
                    <Text style={styles.blockText}>{sanitize(content.caption)}</Text>
                  </View>
                </View>

                {/* Hashtags */}
                {content.hashtags && content.hashtags.length > 0 && (
                  <View style={styles.contentBlock}>
                    <Text style={styles.blockLabel}>الهاشتاجات</Text>
                    <View style={styles.hashtagsRow}>
                      {content.hashtags.map((tag, i) => (
                        <View key={i} style={styles.hashtag}>
                          <Text style={styles.hashtagText}>
                            {sanitize(tag.startsWith('#') ? tag : `#${tag}`)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.footer} fixed>
              <Text style={styles.footerText}>{label} — {sessionName}</Text>
              <Text style={styles.footerBrand}>Nojom AI</Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}

export async function generatePdf(params: PdfParams): Promise<Buffer> {
  const buffer = await renderToBuffer(<PdfDocument {...params} />);
  return buffer;
}
