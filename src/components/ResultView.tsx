'use client';

import { useRef } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface ResultViewProps {
  sessionId: string;
  result: GenerationResult;
  sessionName: string;
  brandName: string;
  influencerName: string;
  campaignGoal: string;
  contentStyle: string;
  createdAt?: string;
  onReset: () => void;
}

export function ResultView({
  sessionId, result, sessionName, brandName,
  influencerName, campaignGoal, contentStyle, createdAt, onReset,
}: ResultViewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const platforms = Object.keys(result);
  const date = createdAt
    ? new Date(createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleDownload = () => {
    window.open(`/api/pdf/${sessionId}`, '_blank');
  };

  return (
    <div dir="rtl">
      {/* ── Action bar (hidden on print) ─────────────────── */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{sessionName}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            محتوى جاهز لـ {platforms.length} منصة
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            <RefreshCw className="w-3.5 h-3.5 ml-1.5" />
            حملة جديدة
          </Button>
          <Button size="sm" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5 ml-1.5" />
            تحميل PDF
          </Button>
        </div>
      </div>

      {/* ── Printable document ───────────────────────────── */}
      <div
        ref={printRef}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-none print:rounded-none"
        id="content-brief"
      >
        {/* Document Header */}
        <div className="px-10 pt-10 pb-8 border-b-2 border-gray-900">
          <h1 className="text-4xl font-black text-gray-900 mb-6 leading-tight">{sessionName}</h1>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'البراند', value: brandName },
              { label: 'الإنفلونسر', value: influencerName },
              { label: 'الهدف', value: campaignGoal },
              { label: 'الأسلوب', value: contentStyle },
              { label: 'التاريخ', value: date },
            ].map(item => (
              <div key={item.label} className="bg-gray-100 rounded-lg px-3 py-2 min-w-[80px]">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Sections */}
        <div className="divide-y divide-gray-100">
          {platforms.map((platform, idx) => {
            const content = result[platform];
            const colors = PLATFORM_COLORS[platform] || { bg: '#111827', light: '#F9FAFB', text: '#111827' };
            const label = PLATFORM_LABELS[platform] || platform;

            return (
              <div key={platform} className="print:break-inside-avoid">
                {/* Platform Header */}
                <div
                  className="px-10 py-5 flex items-center gap-3"
                  style={{ backgroundColor: colors.bg }}
                >
                  <div className="w-3 h-3 rounded-full bg-white/50" />
                  <h2 className="text-xl font-black text-white tracking-wide">{label}</h2>
                  <span className="text-white/60 text-sm mr-auto">#{idx + 1}</span>
                </div>

                {/* Platform Content */}
                <div className="px-10 py-8 space-y-8" style={{ backgroundColor: colors.light }}>

                  {/* Script */}
                  {content.script && (
                    <div>
                      <p
                        className="text-xs font-black uppercase tracking-widest mb-3"
                        style={{ color: colors.text }}
                      >
                        السكريبت / محتوى الفيديو
                      </p>
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <p className="text-base text-gray-800 leading-[2] whitespace-pre-wrap font-medium">
                          {content.script}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Caption */}
                  <div>
                    <p
                      className="text-xs font-black uppercase tracking-widest mb-3"
                      style={{ color: colors.text }}
                    >
                      الكابشن
                    </p>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                      <p className="text-base text-gray-800 leading-[2] whitespace-pre-wrap font-medium">
                        {content.caption}
                      </p>
                    </div>
                  </div>

                  {/* Hashtags */}
                  {content.hashtags && content.hashtags.length > 0 && (
                    <div>
                      <p
                        className="text-xs font-black uppercase tracking-widest mb-3"
                        style={{ color: colors.text }}
                      >
                        الهاشتاجات
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {content.hashtags.map((tag, i) => (
                          <span
                            key={i}
                            className="bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm"
                            dir="ltr"
                          >
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
        </div>

        {/* Document Footer */}
        <div className="px-10 py-5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-400">{sessionName} — {date}</p>
          <p className="text-xs font-bold text-gray-600">Nojom AI Content Generator</p>
        </div>
      </div>

    </div>
  );
}
