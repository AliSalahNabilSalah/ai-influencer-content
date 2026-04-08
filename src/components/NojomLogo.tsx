export function NojomLogo({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const enSize = size === 'lg' ? 22 : size === 'md' ? 18 : 14;
  const arSize = size === 'lg' ? 12 : size === 'md' ? 10 : 8;
  const starSize = size === 'lg' ? 7 : 6;

  return (
    /* Force LTR so RTL context doesn't reverse "nojom" */
    <div dir="ltr" className={`inline-flex flex-col items-start leading-none select-none ${className}`}>
      {/* English row */}
      <div className="flex items-center" style={{ gap: 0 }}>
        <span className="font-black" style={{ fontSize: enSize, letterSpacing: '-0.5px' }}>no</span>
        {/* star above j */}
        <span className="relative" style={{ display: 'inline-block' }}>
          <span className="font-black" style={{ fontSize: enSize, letterSpacing: '-0.5px' }}>j</span>
          <svg
            style={{ position: 'absolute', top: -3, right: -3, width: starSize, height: starSize }}
            viewBox="0 0 8 8" fill="none"
          >
            <path d="M4 0L4.9 2.8L8 4L4.9 5.2L4 8L3.1 5.2L0 4L3.1 2.8Z" fill="#6366f1" />
          </svg>
        </span>
        <span className="font-black" style={{ fontSize: enSize, letterSpacing: '-0.5px' }}>om</span>
      </div>
      {/* Arabic row — switch back to RTL just for this text */}
      <div dir="rtl" style={{ fontSize: arSize, letterSpacing: '0.18em', fontWeight: 700, marginTop: 2 }}>
        نجـوم
      </div>
    </div>
  );
}
