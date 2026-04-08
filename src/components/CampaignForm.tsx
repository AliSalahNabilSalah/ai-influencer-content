'use client';

import { useState } from 'react';
import { Link, Target, Layers, Users, MessageSquare, FileText, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlatformIcon } from '@/components/PlatformIcon';
import type { CampaignFormData, Platform } from '@/types';

const PLATFORMS: { value: Platform; label: string; urlPattern: RegExp; placeholder: string }[] = [
  { value: 'instagram', label: 'إنستجرام', urlPattern: /instagram\.com\//i, placeholder: 'https://instagram.com/username' },
  { value: 'tiktok',    label: 'تيك توك',  urlPattern: /tiktok\.com\//i,    placeholder: 'https://tiktok.com/@username' },
  { value: 'snapchat',  label: 'سناب شات', urlPattern: /snapchat\.com\//i,  placeholder: 'https://snapchat.com/add/username' },
  { value: 'youtube',   label: 'يوتيوب',   urlPattern: /youtube\.com\//i,   placeholder: 'https://youtube.com/@channel' },
  { value: 'twitter',   label: 'تويتر / X',urlPattern: /(twitter\.com|x\.com)\//i, placeholder: 'https://x.com/username' },
  { value: 'facebook',  label: 'فيسبوك',   urlPattern: /facebook\.com\//i,  placeholder: 'https://facebook.com/page' },
];

const CAMPAIGN_GOALS = [
  'زيادة المبيعات', 'إطلاق منتج جديد', 'زيادة الوعي بالبراند',
  'تحميلات التطبيق', 'زيادة الزيارات للموقع', 'الترويج لخدمة',
  'الترويج لحدث', 'أخرى',
];

const CONTENT_STYLES = [
  'كوميدي / مضحك', 'عفوي وطبيعي', 'فاخر وأنيق', 'رسمي واحترافي',
  'تعليمي', 'عاطفي / قصصي', 'نشيط وحماسي', 'أخرى',
];

interface FormState {
  name: string;
  brandName: string;
  brandUrl: string;
  platforms: Platform[];
  influencerName: string;
  influencerAccounts: Record<string, string>;
  campaignGoal: string;
  campaignGoalOther: string;
  contentStyle: string;
  contentStyleOther: string;
  mainMessage: string;
  notes: string;
}

interface CampaignFormProps {
  onSubmit: (data: CampaignFormData) => void;
  isLoading: boolean;
}

function validatePlatformUrl(platform: Platform, url: string): boolean {
  if (!url) return true;
  const p = PLATFORMS.find(p => p.value === platform);
  return p ? p.urlPattern.test(url) : true;
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
      <span className="text-gray-500">{icon}</span>
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
  );
}

export function CampaignForm({ onSubmit, isLoading }: CampaignFormProps) {
  const [form, setForm] = useState<FormState>({
    name: '', brandName: '', brandUrl: '',
    platforms: [], influencerName: '', influencerAccounts: {},
    campaignGoal: '', campaignGoalOther: '',
    contentStyle: '', contentStyleOther: '',
    mainMessage: '', notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [urlErrors, setUrlErrors] = useState<Record<string, boolean>>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const togglePlatform = (p: Platform) => {
    const current = form.platforms;
    const next = current.includes(p) ? current.filter(x => x !== p) : [...current, p];
    set('platforms', next);
    if (current.includes(p)) {
      const accs = { ...form.influencerAccounts };
      delete accs[p];
      set('influencerAccounts', accs);
    }
  };

  const setInfluencerUrl = (platform: Platform, url: string) => {
    set('influencerAccounts', { ...form.influencerAccounts, [platform]: url });
    setUrlErrors(e => ({ ...e, [platform]: url ? !validatePlatformUrl(platform, url) : false }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'اسم الحملة مطلوب';
    if (!form.brandName.trim()) e.brandName = 'اسم البراند مطلوب';
    if (!form.brandUrl.trim()) e.brandUrl = 'رابط البراند مطلوب';
    if (!form.platforms.length) e.platforms = 'اختر منصة واحدة على الأقل';
    if (!form.influencerName.trim()) e.influencerName = 'اسم الإنفلونسر مطلوب';
    const hasAccount = Object.values(form.influencerAccounts).some(v => v.trim());
    if (!hasAccount) e.influencerAccounts = 'أدخل رابط حساب واحد على الأقل';
    const goalFinal = form.campaignGoal === 'أخرى' ? form.campaignGoalOther : form.campaignGoal;
    if (!goalFinal.trim()) e.campaignGoal = 'هدف الحملة مطلوب';
    const styleFinal = form.contentStyle === 'أخرى' ? form.contentStyleOther : form.contentStyle;
    if (!styleFinal.trim()) e.contentStyle = 'أسلوب المحتوى مطلوب';
    if (!form.mainMessage.trim()) e.mainMessage = 'الرسالة الأساسية مطلوبة';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const influencerAccount = Object.values(form.influencerAccounts).find(v => v.trim()) || '';
    const data: CampaignFormData = {
      name: form.name, brandName: form.brandName, brandUrl: form.brandUrl,
      brandSocials: [], platforms: form.platforms,
      influencerName: form.influencerName, influencerAccount,
      influencerAccounts: form.influencerAccounts,
      campaignGoal: form.campaignGoal === 'أخرى' ? form.campaignGoalOther : form.campaignGoal,
      contentStyle: form.contentStyle === 'أخرى' ? form.contentStyleOther : form.contentStyle,
      mainMessage: form.mainMessage, notes: form.notes,
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10" dir="rtl">

      {/* ── اسم الحملة ───────────────────────────────────── */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1.5">
          اسم الحملة <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="مثال: حملة كوليكشن الصيف 2025"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900',
            errors.name ? 'border-red-400' : 'border-gray-300'
          )}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      {/* ── معلومات البراند ──────────────────────────────── */}
      <div className="space-y-4">
        <SectionTitle icon={<Link className="w-4 h-4" />} title="معلومات البراند" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">اسم البراند <span className="text-red-500">*</span></label>
            <input
              type="text" placeholder="نايك، نون، آبل..." value={form.brandName}
              onChange={e => set('brandName', e.target.value)}
              className={cn('w-full px-3 py-2 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900', errors.brandName ? 'border-red-400' : 'border-gray-300')}
            />
            {errors.brandName && <p className="text-xs text-red-500 mt-0.5">{errors.brandName}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">رابط الموقع <span className="text-red-500">*</span></label>
            <input
              type="url" placeholder="https://brand.com" value={form.brandUrl} dir="ltr"
              onChange={e => set('brandUrl', e.target.value)}
              className={cn('w-full px-3 py-2 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900', errors.brandUrl ? 'border-red-400' : 'border-gray-300')}
            />
            {errors.brandUrl && <p className="text-xs text-red-500 mt-0.5">{errors.brandUrl}</p>}
          </div>
        </div>
        <p className="text-xs text-gray-400 flex items-center gap-1.5">
          <span>🔍</span>
          سيقوم النظام تلقائياً بالبحث عن حسابات البراند على السوشيال ميديا
        </p>
      </div>

      {/* ── هدف الحملة ──────────────────────────────────── */}
      <div className="space-y-4">
        <SectionTitle icon={<Target className="w-4 h-4" />} title="هدف الحملة" />
        <div className="flex flex-wrap gap-2">
          {CAMPAIGN_GOALS.map(g => (
            <button key={g} type="button" onClick={() => set('campaignGoal', g)}
              className={cn(
                'px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all',
                form.campaignGoal === g ? 'bg-gray-900 border-gray-900 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
              )}>
              {g}
            </button>
          ))}
        </div>
        {form.campaignGoal === 'أخرى' && (
          <input autoFocus type="text" placeholder="اكتب هدف الحملة..."
            value={form.campaignGoalOther} onChange={e => set('campaignGoalOther', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        )}
        {errors.campaignGoal && <p className="text-xs text-red-500">{errors.campaignGoal}</p>}
      </div>

      {/* ── المنصات ─────────────────────────────────────── */}
      <div className="space-y-4">
        <SectionTitle icon={<Layers className="w-4 h-4" />} title="المنصات المطلوب إنشاء محتوى لها" />
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(p => {
            const selected = form.platforms.includes(p.value);
            return (
              <button key={p.value} type="button" onClick={() => togglePlatform(p.value)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                  selected
                    ? 'bg-gray-900 border-gray-900 text-white shadow-md scale-105'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                )}>
                <PlatformIcon platform={p.value} size={15} colored={!selected} className={selected ? 'text-white' : ''} />
                <span>{p.label}</span>
                {selected && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
        {errors.platforms && <p className="text-xs text-red-500">{errors.platforms}</p>}
      </div>

      {/* ── الإنفلونسر + روابط الحسابات ─────────────────── */}
      <div className="space-y-4">
        <SectionTitle icon={<Users className="w-4 h-4" />} title="الإنفلونسر" />

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">اسم الإنفلونسر <span className="text-red-500">*</span></label>
          <input
            type="text" placeholder="@username أو الاسم الكامل" value={form.influencerName}
            onChange={e => set('influencerName', e.target.value)}
            className={cn('w-full px-3 py-2 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900', errors.influencerName ? 'border-red-400' : 'border-gray-300')}
          />
          {errors.influencerName && <p className="text-xs text-red-500 mt-0.5">{errors.influencerName}</p>}
        </div>

        {form.platforms.length > 0 ? (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">
              روابط حسابات الإنفلونسر <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal mr-1">(أدخل رابطاً واحداً على الأقل)</span>
            </label>
            {form.platforms.map(platform => {
              const p = PLATFORMS.find(x => x.value === platform)!;
              const urlVal = form.influencerAccounts[platform] || '';
              const hasError = urlErrors[platform];
              const isValid = urlVal && !hasError;
              return (
                <div key={platform} className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-7 flex items-center justify-center">
                    <PlatformIcon platform={platform} size={16} colored={true} />
                  </span>
                  <span className="text-xs font-medium text-gray-600 w-20 flex-shrink-0">{p.label}</span>
                  <div className="flex-1 relative">
                    <input
                      type="url" placeholder={p.placeholder} value={urlVal} dir="ltr"
                      onChange={e => setInfluencerUrl(platform, e.target.value)}
                      className={cn(
                        'w-full px-3 py-2 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900',
                        hasError ? 'border-red-400' : isValid ? 'border-green-300' : 'border-gray-200',
                        urlVal ? 'pl-8' : ''
                      )}
                    />
                    {urlVal && (
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                        {isValid
                          ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                          : <AlertCircle className="w-4 h-4 text-red-400" />}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {errors.influencerAccounts && <p className="text-xs text-red-500">{errors.influencerAccounts}</p>}
          </div>
        ) : (
          <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            اختر المنصات أولاً لتظهر حقول روابط حسابات الإنفلونسر
          </p>
        )}
      </div>

      {/* ── تفاصيل المحتوى ───────────────────────────────── */}
      <div className="space-y-4">
        <SectionTitle icon={<MessageSquare className="w-4 h-4" />} title="تفاصيل المحتوى" />

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">أسلوب المحتوى <span className="text-red-500">*</span></label>
          <div className="flex flex-wrap gap-2">
            {CONTENT_STYLES.map(s => (
              <button key={s} type="button" onClick={() => set('contentStyle', s)}
                className={cn(
                  'px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all',
                  form.contentStyle === s ? 'bg-gray-900 border-gray-900 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                )}>
                {s}
              </button>
            ))}
          </div>
          {form.contentStyle === 'أخرى' && (
            <input autoFocus type="text" placeholder="اكتب أسلوب المحتوى..."
              value={form.contentStyleOther} onChange={e => set('contentStyleOther', e.target.value)}
              className="w-full mt-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          )}
          {errors.contentStyle && <p className="text-xs text-red-500 mt-1">{errors.contentStyle}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            الرسالة الأساسية / بريف الحملة <span className="text-red-500">*</span>
          </label>
          <textarea rows={4} placeholder="اكتب رسالة الحملة، النقاط الأساسية التي يجب على الإنفلونسر ذكرها..."
            value={form.mainMessage} onChange={e => set('mainMessage', e.target.value)}
            className={cn('w-full px-3 py-2 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none', errors.mainMessage ? 'border-red-400' : 'border-gray-300')}
          />
          {errors.mainMessage && <p className="text-xs text-red-500 mt-0.5">{errors.mainMessage}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            <FileText className="w-3 h-3 inline ml-1" />ملاحظات إضافية (اختياري)
          </label>
          <textarea rows={2} placeholder="أي تعليمات خاصة، أشياء يجب تجنبها..."
            value={form.notes} onChange={e => set('notes', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading} size="lg" className="w-full gap-2">
        <Sparkles className="w-4 h-4" />
        {isLoading ? 'جاري التوليد...' : 'توليد محتوى الحملة'}
      </Button>
    </form>
  );
}
