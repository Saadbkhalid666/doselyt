const tones = {
  accent: "bg-accent",
  warn: "bg-warn",
  crit: "bg-crit",
  ink: "bg-ink",
};

export default function ProgressBar({
  value = 0,
  tone = "accent",
  className = "",
}) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
  const barTone = tones[tone] || tones.accent;

  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-subtle ${className}`}
      role="progressbar"
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${barTone}`}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}