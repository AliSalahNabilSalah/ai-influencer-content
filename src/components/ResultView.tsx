'use client';

import { useState, useRef } from 'react';
import { Download, Plus, Copy, Check, RefreshCw, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlatformIcon, PLATFORM_META } from './PlatformIcon';
import { ProgressLoader } from './ProgressLoader';
import type { GenerationResult } from '@/types';

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
  onRegenerateAll: (notes: string) => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1.5 rounded-lg transition-colors"
      style={{ color: copied ? '#10b981' : '#ccc' }}
      title="نسخ"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

const ACCENT = '#6366f1';

export function ResultView({
  sessionId, result: initialResult, sessionName, brandName,
  influencerName, campaignGoal, contentStyle, createdAt, onReset, onRegenerateAll,
}: ResultViewProps) {
  const [result, setResult] = useState<GenerationResult>(initialResult);
  const [activeTab, setActiveTab] = useState(Object.keys(initialResult)[0]);

  // Regenerate state
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenPercent, setRegenPercent] = useState(0);
  const [regenMessage, setRegenMessage] = useState('');
  const [regenIsError, setRegenIsError] = useState(false);

  // Per-platform notes
  const [platformNotes, setPlatformNotes] = useState<Record<string, string>>({});
  // Global notes for "regenerate all"
  const [globalNotes, setGlobalNotes] = useState('');
  const [showGlobalRegen, setShowGlobalRegen] = useState(false);
  const globalNotesRef = useRef<HTMLTextAreaElement>(null);

  const platforms = Object.keys(result);
  const date = createdAt
    ? new Date(createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  const activeMeta = PLATFORM_META[activeTab] || { label: activeTab, color: '#6366f1', bg: '#6366f1', light: '#f5f5ff', text: '#6366f1' };
  const activeContent = result[activeTab];

  // ── Regenerate handler ──────────────────────────────────────────
  async function handleRegenerate(targetPlatforms: string[] | 'all', notes: string) {
    setRegenLoading(true);
    setRegenIsError(false);
    setRegenPercent(0);
    setRegenMessage('جاري التحضير...');

    try {
      const res = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, platforms: targetPlatforms, notes }),
      });

      if (!res.ok || !res.body) throw new Error('فشل الاتصال');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'progress') {
              setRegenPercent(event.percent);
              setRegenMessage(event.message);
            } else if (event.type === 'done') {
              setResult(event.result);
              setRegenLoading(false);
              setShowGlobalRegen(false);
              setGlobalNotes('');
            } else if (event.type === 'error') {
              setRegenIsError(true);
              setRegenMessage(event.message);
              setTimeout(() => setRegenLoading(false), 2500);
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      setRegenIsError(true);
      setRegenMessage(err instanceof Error ? err.message : 'خطأ غير معروف');
      setTimeout(() => setRegenLoading(false), 2500);
    }
  }

  return (
    <div dir="rtl" className="space-y-5">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">{sessionName}</h2>
          <p className="text-sm text-gray-400 mt-0.5">{brandName} · {influencerName}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition-colors"
            style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
          >
            <Plus size={14} />
            حملة جديدة
          </button>

          {/* Regenerate All toggle */}
          <button
            onClick={() => { setShowGlobalRegen(v => !v); setTimeout(() => globalNotesRef.current?.focus(), 100); }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all"
            style={{
              borderColor: showGlobalRegen ? ACCENT : '#e5e7eb',
              color: showGlobalRegen ? ACCENT : '#6b7280',
              background: showGlobalRegen ? '#eef2ff' : 'white',
            }}
          >
            <RotateCcw size={14} />
            إعادة إنشاء الكل
          </button>

          <button
            onClick={() => window.open(`/api/pdf/${sessionId}`, '_blank')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-white transition-colors"
            style={{ background: '#111827' }}
          >
            <Download size={14} />
            تحميل PDF
          </button>
        </div>
      </div>

      {/* ── Global Regen Panel ───────────────────────────────── */}
      {showGlobalRegen && (
        <div
          className="rounded-2xl border p-4 space-y-3"
          style={{ borderColor: `${ACCENT}40`, background: '#fafafe' }}
        >
          <p className="text-sm font-semibold" style={{ color: ACCENT }}>
            إعادة إنشاء المحتوى لجميع المنصات ({platforms.length})
          </p>
          <textarea
            ref={globalNotesRef}
            value={globalNotes}
            onChange={e => setGlobalNotes(e.target.value)}
            placeholder="ملاحظات للتحسين... (مثال: اجعل المحتوى أطول، ركز أكثر على العرض، غيّر الأسلوب ليكون أكثر فكاهة)"
            rows={3}
            className="w-full text-sm rounded-xl border px-4 py-3 resize-none outline-none transition-colors"
            style={{ borderColor: '#e5e7eb', fontFamily: 'inherit' }}
            onFocus={e => (e.target.style.borderColor = ACCENT)}
            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowGlobalRegen(false); setGlobalNotes(''); }}
              className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors"
              style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
            >
              إلغاء
            </button>
            <button
              onClick={() => { onRegenerateAll(globalNotes); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: ACCENT }}
            >
              <RefreshCw size={13} />
              إعادة الإنشاء للكل
            </button>
          </div>
        </div>
      )}

      {/* ── Meta chips ──────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'الهدف', value: campaignGoal },
          { label: 'الأسلوب', value: contentStyle },
          { label: 'التاريخ', value: date },
        ].map(item => (
          <div key={item.label} className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>

      {/* ── Platform Tabs ─────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {platforms.map(platform => {
          const meta = PLATFORM_META[platform] || { label: platform, color: '#111' };
          const isActive = activeTab === platform;
          return (
            <button
              key={platform}
              onClick={() => setActiveTab(platform)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 border"
              style={isActive
                ? { backgroundColor: meta.color, borderColor: meta.color, color: platform === 'snapchat' ? '#3D2E00' : '#fff', boxShadow: `0 4px 12px ${meta.color}40` }
                : { backgroundColor: 'white', borderColor: '#e5e7eb', color: '#6b7280' }
              }
            >
              <PlatformIcon platform={platform} size={15} colored={!isActive} className={isActive ? 'text-white' : ''} />
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* ── Content area (loader OR content) ────────────────── */}
      <div
        className="rounded-2xl border overflow-hidden shadow-sm"
        style={{ borderColor: `${activeMeta.color}30` }}
      >
        {/* Platform header */}
        <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: activeMeta.color }}>
          {/* Snapchat: white ring around icon so it shows on yellow bg */}
          <div style={activeTab === 'snapchat' ? { borderRadius: 8, boxShadow: '0 0 0 2.5px white' } : {}}>
            <PlatformIcon platform={activeTab} size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: activeTab === 'snapchat' ? '#3D2E00' : 'white' }}>{activeMeta.label}</h3>
            <p className="text-xs" style={{ color: activeTab === 'snapchat' ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.6)' }}>
              {activeContent?.script ? 'سكريبت + كابشن + هاشتاجات' : 'كابشن + هاشتاجات'}
            </p>
          </div>
        </div>

        {regenLoading ? (
          /* Loader during regeneration */
          <div className="px-6 py-8" style={{ backgroundColor: activeMeta.light }}>
            <ProgressLoader percent={regenPercent} message={regenMessage} isError={regenIsError} />
          </div>
        ) : (
          /* Content */
          <div className="p-6 space-y-6" style={{ backgroundColor: activeMeta.light }}>

            {/* Script */}
            {activeContent?.script && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-black uppercase tracking-widest" style={{ color: activeMeta.text }}>السكريبت / محتوى الفيديو</p>
                  <CopyButton text={activeContent.script} />
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <p className="text-sm text-gray-800 leading-[2.2] whitespace-pre-wrap">{activeContent.script}</p>
                </div>
              </div>
            )}

            {/* Caption */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: activeMeta.text }}>الكابشن</p>
                <CopyButton text={activeContent?.caption || ''} />
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-800 leading-[2.2] whitespace-pre-wrap">{activeContent?.caption}</p>
              </div>
            </div>

            {/* Hashtags */}
            {activeContent?.hashtags && activeContent.hashtags.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-black uppercase tracking-widest" style={{ color: activeMeta.text }}>الهاشتاجات</p>
                  <CopyButton text={activeContent.hashtags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ')} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeContent.hashtags.map((tag, i) => (
                    <span key={i} className="bg-white border border-gray-100 rounded-full px-3.5 py-1.5 text-sm font-medium text-gray-600 shadow-sm" dir="ltr">
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Per-platform Regenerate section ──────────── */}
            <div
              className="rounded-xl border p-4 space-y-3 mt-2"
              style={{ borderColor: '#f0f0f8', background: 'rgba(255,255,255,0.7)' }}
            >
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#aaa' }}>
                إعادة الإنشاء — {activeMeta.label}
              </p>
              <textarea
                value={platformNotes[activeTab] || ''}
                onChange={e => setPlatformNotes(prev => ({ ...prev, [activeTab]: e.target.value }))}
                placeholder={`ملاحظات للتحسين... (مثال: اجعله أطول، ركز على السعر، غيّر الافتتاحية)`}
                rows={2}
                className="w-full text-sm rounded-xl border px-4 py-3 resize-none outline-none transition-colors bg-white"
                style={{ borderColor: '#e5e7eb', fontFamily: 'inherit' }}
                onFocus={e => (e.target.style.borderColor = activeMeta.color)}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
              />
              <div className="flex justify-end">
                <button
                  onClick={() => handleRegenerate([activeTab], platformNotes[activeTab] || '')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: activeMeta.color, boxShadow: `0 2px 8px ${activeMeta.color}40` }}
                >
                  <RefreshCw size={13} />
                  إعادة إنشاء {activeMeta.label}
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
