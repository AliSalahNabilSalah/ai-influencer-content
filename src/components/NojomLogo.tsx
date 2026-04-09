const widthMap = {
  sm: 80,
  md: 140,
  lg: 200,
};

export function NojomLogo({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const w = widthMap[size];
  return (
    <img
      src="/icons/nojom.webp"
      alt="Nojom"
      width={w}
      className={`select-none ${className}`}
      style={{ objectFit: 'contain', height: 'auto' }}
    />
  );
}
