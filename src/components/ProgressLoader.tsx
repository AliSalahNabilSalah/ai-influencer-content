'use client';

import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressLoaderProps {
  percent: number;
  message: string;
  isError?: boolean;
}

const STAGES = [
  { min: 0, max: 20, label: 'بحث البراند' },
  { min: 20, max: 65, label: 'تحليل الإنفلونسر' },
  { min: 65, max: 95, label: 'توليد المحتوى' },
  { min: 95, max: 100, label: 'تجهيز الملف' },
];

export function ProgressLoader({ percent, message, isError }: ProgressLoaderProps) {
  return (
    <div className="w-full max-w-lg mx-auto py-12 space-y-8" dir="rtl">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="54" fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle
              cx="64" cy="64" r="54"
              fill="none"
              stroke={isError ? '#ef4444' : '#111827'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - percent / 100)}`}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isError ? (
              <XCircle className="w-8 h-8 text-red-500" />
            ) : percent === 100 ? (
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            ) : (
              <>
                <span className="text-2xl font-bold text-gray-900">{percent}%</span>
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin mt-1" />
              </>
            )}
          </div>
        </div>
        <p className={cn('text-sm font-medium text-center', isError ? 'text-red-600' : 'text-gray-700')}>
          {message}
        </p>
      </div>

      <div className="space-y-2">
        {STAGES.map((stage) => {
          const isDone = percent > stage.max;
          const isActive = percent >= stage.min && percent <= stage.max;
          return (
            <div key={stage.label} className="flex items-center gap-3">
              <div className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                isDone ? 'bg-gray-900' : isActive ? 'bg-gray-200' : 'bg-gray-100'
              )}>
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                ) : isActive ? (
                  <Loader2 className="w-3 h-3 text-gray-600 animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                )}
              </div>
              <span className={cn('text-sm', isDone ? 'text-gray-900 font-medium' : isActive ? 'text-gray-700' : 'text-gray-400')}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
