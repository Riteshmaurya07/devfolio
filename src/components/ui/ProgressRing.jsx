export default function ProgressRing({
  percentage = 0,
  size = 80,
  strokeWidth = 6,
  color = '#7C3AED',
  trackColor = '#1E1E22',
  label,
  sublabel,
  showPercent = true,
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          />
        </svg>
        {/* Center label */}
        {showPercent && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-text-primary">{Math.round(percentage)}%</span>
          </div>
        )}
      </div>
      {label && <p className="text-xs font-medium text-text-primary text-center">{label}</p>}
      {sublabel && <p className="text-2xs text-text-muted text-center">{sublabel}</p>}
    </div>
  )
}
