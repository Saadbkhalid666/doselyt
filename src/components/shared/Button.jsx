
const variants = {
  primary: "bg-ink text-bg hover:bg-ink/85",
  accent: "bg-accent text-bg hover:bg-accent/90",
  secondary: "border border-line bg-surface text-ink hover:bg-subtle",
  ghost: "text-muted hover:bg-subtle hover:text-ink",
  danger: "bg-crit text-bg hover:bg-crit/90",
};

const sizes = {
  sm: "h-8 px-2.5 text-xs gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  lg: "h-10 px-4 text-sm gap-2",
};

export default function Button({
  variant = "secondary",
  size = "md",
  icon: Icon,
  children,
  className = "",
  type = "button",
  ...rest
}) {
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {Icon && <Icon className="h-4 w-4" strokeWidth={1.75} />}
      {children}
    </button>
  );
}

export function IconButton({
  icon: Icon,
  label,
  className = "",
  type = "button",
  ...rest
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-subtle hover:text-ink ${className}`}
      {...rest}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}
