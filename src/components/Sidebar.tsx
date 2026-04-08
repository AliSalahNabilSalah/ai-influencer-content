'use client';

import { useEffect, useState } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NojomLogo } from './NojomLogo';
import { PlatformIcon } from './PlatformIcon';

interface SessionSummary {
  id: string;
  name: string;
  brandName: string;
  platforms: string[];
  status: string;
  createdAt: string;
}

interface SidebarProps {
  activeSessionId?: string;
  onSelectSession: (id: string) => void;
  onNewCampaign: () => void;
  refreshTrigger?: number;
}

export function Sidebar({ activeSessionId, onSelectSession, onNewCampaign, refreshTrigger }: SidebarProps) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSessions = () => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(setSessions)
      .catch(console.error);
  };

  useEffect(() => { loadSessions(); }, [refreshTrigger]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside
      className="w-64 min-h-screen flex flex-col"
      dir="rtl"
      style={{ background: '#ffffff', borderLeft: '1px solid #ebebf0' }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b" style={{ borderColor: '#ebebf0' }}>
        <NojomLogo size="md" className="text-gray-900" />
      </div>

      {/* New Campaign button */}
      <div className="px-4 pt-4 pb-1">
        <button
          onClick={onNewCampaign}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
          style={{ background: '#6366f1', color: '#fff' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#4f46e5')}
          onMouseLeave={e => (e.currentTarget.style.background = '#6366f1')}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          حملة جديدة
        </button>
      </div>

      {/* Section label */}
      <div className="px-5 pt-4 pb-1">
        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#aaa' }}>
          الحملات السابقة
        </p>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5 mt-1">
        {sessions.length === 0 ? (
          <div className="py-10 text-center">
            <FileText className="w-7 h-7 mx-auto mb-2" style={{ color: '#e0e0e0' }} />
            <p className="text-xs" style={{ color: '#bbb' }}>لا توجد حملات بعد</p>
          </div>
        ) : (
          sessions.map(session => {
            const isActive = activeSessionId === session.id;
            const isDone = session.status === 'done';

            return (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={cn(
                  'w-full text-right px-3 py-3 rounded-xl transition-all duration-150 group relative',
                )}
                style={{
                  background: isActive ? '#EEF2FF' : 'transparent',
                  border: isActive ? '1px solid #c7d2fe' : '1px solid transparent',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8f8fc'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Delete btn */}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={e => handleDelete(e, session.id)}
                  className="absolute left-2 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50"
                  style={{ color: '#ccc' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#ccc')}
                >
                  {deletingId === session.id ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" className="animate-spin" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <Trash2 size={12} />
                  )}
                </span>

                {/* Name */}
                <p className="text-sm font-semibold truncate leading-tight" style={{ color: isActive ? '#4338ca' : '#111' }}>
                  {session.name}
                </p>

                {/* Brand */}
                <p className="text-xs truncate mt-0.5" style={{ color: isActive ? '#818cf8' : '#999' }}>
                  {session.brandName}
                </p>

                {/* Platform icons + status */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5">
                    {session.platforms.slice(0, 6).map(p => (
                      <span
                        key={p}
                        className="flex items-center justify-center w-5 h-5 rounded-md"
                        style={{ background: isActive ? '#e0e7ff' : '#f3f4f6' }}
                        title={p}
                      >
                        <PlatformIcon platform={p} size={11} colored={true} />
                      </span>
                    ))}
                  </div>
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: isDone ? '#34d399' : '#fbbf24' }}
                  />
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid #ebebf0' }}>
        <p className="text-[10px] text-center" style={{ color: '#ccc' }}>
          Nojom AI · مولّد محتوى ذكي
        </p>
      </div>
    </aside>
  );
}
