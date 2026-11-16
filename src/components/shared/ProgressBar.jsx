const tones = { accent: 'bg-accent', warn: 'bg-warn', crit: 'bg-crit', ink: 'bg-ink' };

/** value: 0–100, already computed by the caller. */
export default function ProgressBar({ value = 0, tone = 'accent', className = '' }) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-subtle ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full transition-[width] duration-500 ${tones[tone]}`} style={{ width: `${value}%` }} />
    </div>
  );
}
