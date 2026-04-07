'use client';

import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { CampaignForm } from '@/components/CampaignForm';
import { ProgressLoader } from '@/components/ProgressLoader';
import { ResultView } from '@/components/ResultView';
import type { CampaignFormData, GenerationResult } from '@/types';

type ViewState = 'form' | 'loading' | 'result';

interface SessionMeta {
  name: string;
  brandName: string;
  influencerName: string;
  campaignGoal: string;
  contentStyle: string;
  createdAt?: string;
}

export default function Home() {
  const [view, setView] = useState<ViewState>('form');
  const [progress, setProgress] = useState({ percent: 0, message: 'جاري البدء...' });
  const [isError, setIsError] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [sessionMeta, setSessionMeta] = useState<SessionMeta>({ name: '', brandName: '', influencerName: '', campaignGoal: '', contentStyle: '' });
  const [sidebarRefresh, setSidebarRefresh] = useState(0);

  const handleGenerate = useCallback(async (data: CampaignFormData) => {
    setView('loading');
    setIsError(false);
    setProgress({ percent: 0, message: 'جاري التهيئة...' });
    setSessionMeta({
      name: data.name,
      brandName: data.brandName,
      influencerName: data.influencerName,
      campaignGoal: data.campaignGoal,
      contentStyle: data.contentStyle,
    });

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok || !res.body) throw new Error('فشل بدء عملية التوليد');

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
            if (event.type === 'session') {
              setActiveSessionId(event.sessionId);
            } else if (event.type === 'progress') {
              setProgress({ percent: event.percent, message: event.message });
            } else if (event.type === 'done') {
              setResult(event.result);
              setSidebarRefresh(n => n + 1);
              setView('result');
            } else if (event.type === 'error') {
              setIsError(true);
              setProgress({ percent: 0, message: event.message });
              setTimeout(() => setView('form'), 3000);
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطأ غير معروف';
      setIsError(true);
      setProgress({ percent: 0, message });
      setTimeout(() => setView('form'), 3000);
    }
  }, []);

  const handleSelectSession = useCallback(async (id: string) => {
    setActiveSessionId(id);
    try {
      const res = await fetch(`/api/sessions/${id}`);
      const session = await res.json();
      if (session.result) {
        setResult(session.result);
        setSessionMeta({
          name: session.name,
          brandName: session.brandName,
          influencerName: (typeof session.influencer === 'string' ? JSON.parse(session.influencer) : session.influencer)?.name || '',
          campaignGoal: session.campaignGoal,
          contentStyle: session.contentStyle,
          createdAt: session.createdAt,
        });
        setView('result');
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleReset = useCallback(() => {
    setView('form');
    setResult(null);
    setActiveSessionId(undefined);
    setProgress({ percent: 0, message: '' });
    setIsError(false);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      <main className="flex-1 overflow-y-auto order-1">
        <div className="max-w-3xl mx-auto px-8 py-10">

          {view === 'form' && (
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">حملة إعلانية جديدة</h1>
                <p className="text-gray-500 mt-1.5">
                  أدخل بيانات الحملة وسيقوم الذكاء الاصطناعي بتوليد محتوى مخصص لكل منصة بأسلوب الإنفلونسر.
                </p>
              </div>
              <CampaignForm onSubmit={handleGenerate} isLoading={false} />
            </>
          )}

          {view === 'loading' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <ProgressLoader percent={progress.percent} message={progress.message} isError={isError} />
            </div>
          )}

          {view === 'result' && result && (
            <ResultView
              sessionId={activeSessionId!}
              result={result}
              sessionName={sessionMeta.name}
              brandName={sessionMeta.brandName}
              influencerName={sessionMeta.influencerName}
              campaignGoal={sessionMeta.campaignGoal}
              contentStyle={sessionMeta.contentStyle}
              createdAt={sessionMeta.createdAt}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      <Sidebar
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        refreshTrigger={sidebarRefresh}
      />
    </div>
  );
}
