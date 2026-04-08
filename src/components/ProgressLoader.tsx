'use client';

import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NojomLogo } from './NojomLogo';

interface Stage { min: number; max: number; label: string; }

interface ProgressLoaderProps {
  percent: number;
  message: string;
  isError?: boolean;
  mode?: 'generate' | 'regenerate';
}

const GENERATE_STAGES: Stage[] = [
  { min: 0,  max: 20,  label: 'بحث البراند' },
  { min: 20, max: 65,  label: 'تحليل الإنفلونسر' },
  { min: 65, max: 95,  label: 'توليد المحتوى' },
  { min: 95, max: 100, label: 'تجهيز الملف' },
];

const REGENERATE_STAGES: Stage[] = [
  { min: 0,  max: 30,  label: 'التحضير' },
  { min: 30, max: 90,  label: 'توليد المحتوى' },
  { min: 90, max: 100, label: 'حفظ النتائج' },
];

const ACCENT = '#6366f1';

export function ProgressLoader({ percent, message, isError, mode = 'generate' }: ProgressLoaderProps) {
  const stages = mode === 'regenerate' ? REGENERATE_STAGES : GENERATE_STAGES;

  return (
    <div className="w-full max-w-sm mx-auto py-10 space-y-8" dir="rtl">

      {/* Logo */}
      <div className="flex justify-center">
        <NojomLogo size="lg" className="text-gray-900" />
      </div>

      {/* Circle progress */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-28 h-28">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
            <circle cx="56" cy="56" r="46" fill="none" stroke="#f0f0f5" strokeWidth="8" />
            <circle
              cx="56" cy="56" r="46"
              fill="none"
              stroke={isError ? '#ef4444' : ACCENT}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 46}`}
              strokeDashoffset={`${2 * Math.PI * 46 * (1 - percent / 100)}`}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isError ? (
              <XCircle className="w-7 h-7 text-red-500" />
            ) : percent === 100 ? (
              <CheckCircle2 className="w-7 h-7" style={{ color: ACCENT }} />
            ) : (
              <>
                <span className="text-2xl font-bold text-gray-900">{percent}%</span>
                <Loader2 className="w-3.5 h-3.5 animate-spin mt-1" style={{ color: ACCENT }} />
              </>
            )}
          </div>
        </div>

        <p className={cn('text-sm font-medium text-center max-w-xs', isError ? 'text-red-600' : 'text-gray-500')}>
          {message}
        </p>
      </div>

      {/* Stages */}
      <div className="space-y-2.5">
        {stages.map((stage) => {
          const isDone = percent > stage.max;
          const isActive = percent >= stage.min && percent <= stage.max;
          return (
            <div key={stage.label} className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                style={{
                  background: isDone ? ACCENT : isActive ? '#eef2ff' : '#f5f5f8',
                  border: isActive ? `1.5px solid ${ACCENT}` : 'none',
                }}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                ) : isActive ? (
                  <Loader2 className="w-3 h-3 animate-spin" style={{ color: ACCENT }} />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                )}
              </div>
              <span
                className={cn('text-sm transition-colors duration-300', isDone ? 'text-gray-800 font-semibold' : isActive ? 'font-semibold' : 'text-gray-400')}
                style={{ color: isActive ? ACCENT : undefined }}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
