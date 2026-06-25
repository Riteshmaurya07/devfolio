export function SkeletonCard({ className = '', lines = 3, height = 'h-32' }) {
  return (
    <div className={`card space-y-3 ${height} ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton rounded-md"
          style={{
            height: i === 0 ? '16px' : '12px',
            width: i === 0 ? '60%' : `${Math.random() * 30 + 55}%`,
            opacity: 1 - i * 0.15,
          }}
        />
      ))}
    </div>
  )
}

export function SkeletonText({ width = 'w-full', height = 'h-4', className = '' }) {
  return <div className={`skeleton rounded-md ${width} ${height} ${className}`} />
}

export function SkeletonAvatar({ size = 'w-10 h-10' }) {
  return <div className={`skeleton rounded-full ${size}`} />
}

export function SkeletonGrid({ cols = 3, count = 6 }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
