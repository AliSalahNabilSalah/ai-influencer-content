'use client';

import { useEffect, useState } from 'react';
import { Clock, FileText, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionSummary {
  id: string;
  name: string;
  brandName: string;
  platforms: string[];
  status: string;
  createdAt: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-pink-100 text-pink-700',
  tiktok: 'bg-gray-100 text-gray-700',
  snapchat: 'bg-yellow-100 text-yellow-700',
  youtube: 'bg-red-100 text-red-700',
  twitter: 'bg-sky-100 text-sky-700',
  facebook: 'bg-blue-100 text-blue-700',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  done: { label: 'مكتمل', color: 'text-green-600' },
  processing: { label: 'جاري المعالجة', color: 'text-yellow-600' },
  error: { label: 'خطأ', color: 'text-red-500' },
  pending: { label: 'في الانتظار', color: 'text-gray-400' },
};

interface SidebarProps {
  activeSessionId?: string;
  onSelectSession: (id: string) => void;
  refreshTrigger?: number;
}

export function Sidebar({ activeSessionId, onSelectSession, refreshTrigger }: SidebarProps) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(setSessions)
      .catch(console.error);
  }, [refreshTrigger]);

  return (
    <aside className="w-72 min-h-screen bg-white border-l border-gray-200 flex flex-col" dir="rtl">
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">ن</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">نجوم</p>
            <p className="text-xs text-gray-400">مولّد محتوى AI</p>
          </div>
        </div>
      </div>

      <div className="px-3 py-3 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
          الحملات السابقة
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {sessions.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">لا توجد حملات بعد</p>
          </div>
        ) : (
          sessions.map(session => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={cn(
                'w-full text-right px-3 py-2.5 mx-1 rounded-lg transition-colors group flex items-start gap-2',
                activeSessionId === session.id ? 'bg-gray-100' : 'hover:bg-gray-50'
              )}
            >
              <ChevronLeft className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{session.name}</p>
                <p className="text-xs text-gray-500 truncate">{session.brandName}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {session.platforms.slice(0, 3).map(p => (
                    <span key={p} className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', PLATFORM_COLORS[p] || 'bg-gray-100 text-gray-600')}>
                      {p}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-2.5 h-2.5 text-gray-400" />
                  <span className="text-[10px] text-gray-400">
                    {new Date(session.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                  {STATUS_LABELS[session.status] && (
                    <span className={cn('text-[10px] font-medium mr-auto', STATUS_LABELS[session.status].color)}>
                      {STATUS_LABELS[session.status].label}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
