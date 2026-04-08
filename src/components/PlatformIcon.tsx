interface PlatformIconProps {
  platform: string;
  size?: number;
  className?: string;
  colored?: boolean;
}

export function PlatformIcon({ platform, size = 16, className = '', colored = false }: PlatformIconProps) {
  const meta = PLATFORM_META[platform];
  const color = colored && meta ? meta.color : 'currentColor';

  switch (platform) {
    case 'instagram':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.8" fill={color} stroke="none" />
        </svg>
      );

    case 'tiktok':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
        </svg>
      );

    case 'snapchat':
      // Use official PNG icon
      // eslint-disable-next-line @next/next/no-img-element
      return <img src="/icons/snapchat.png" width={size} height={size} alt="snapchat" className={className} style={{ borderRadius: Math.round(size * 0.22), display: 'inline-block' }} />;

    case 'youtube':
      // When colored=true: red bg + white play. When colored=false (white context): red bg + white play still works
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
          <rect x="2" y="5" width="20" height="14" rx="3" fill={colored ? '#FF0000' : 'currentColor'} />
          <polygon points="10,9 10,15 16,12" fill={colored ? 'white' : '#FF0000'} />
        </svg>
      );

    case 'twitter':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );

    case 'facebook':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );

    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className={className}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

export const PLATFORM_META: Record<string, { label: string; color: string; bg: string; light: string; text: string }> = {
  instagram: { label: 'إنستجرام', color: '#E1306C', bg: '#E1306C', light: '#FFF5F9', text: '#C81060' },
  tiktok:    { label: 'تيك توك',   color: '#111111', bg: '#111111', light: '#F7F7F7', text: '#111111' },
  snapchat:  { label: 'سناب شات', color: '#F0B429', bg: '#FFFC00', light: '#FFFDE7', text: '#8A6200' },
  youtube:   { label: 'يوتيوب',    color: '#FF0000', bg: '#FF0000', light: '#FFF5F5', text: '#CC0000' },
  twitter:   { label: 'تويتر / X', color: '#111111', bg: '#111111', light: '#F7F7F7', text: '#111111' },
  facebook:  { label: 'فيسبوك',   color: '#1877F2', bg: '#1877F2', light: '#EFF4FF', text: '#1877F2' },
};
