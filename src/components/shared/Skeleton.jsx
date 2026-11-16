export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-subtle ${className}`} />;
}

export function CardGridSkeleton({ count = 6, cols = 'sm:grid-cols-2 xl:grid-cols-3', height = 'h-40' }) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => <Skeleton key={i} className={`${height} rounded-lg`} />)}
    </div>
  );
}

export function StatsSkeleton() {
  return <CardGridSkeleton count={4} cols="grid-cols-2 lg:grid-cols-4" height="h-28" />;
}
