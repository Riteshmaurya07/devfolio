import { useState } from 'react'

export default function ResizeHandle({
  onMouseDown,
  onKeyDown,
  isDragging,
  valueNow,
  valueMin = 320,
  valueMax = 650,
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-valuemin={valueMin}
      aria-valuemax={valueMax}
      aria-valuenow={Math.round(valueNow)}
      onMouseDown={onMouseDown}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-2 h-full flex-shrink-0 cursor-col-resize select-none z-10 transition-colors duration-150 focus:outline-none"
      style={{ touchAction: 'none' }}
    >
      {/* Background container glow */}
      <div 
        className={`absolute inset-y-0 -left-1 -right-1 transition-all duration-200 ${
          isDragging 
            ? 'bg-violet/10 scale-x-110' 
            : isHovered 
            ? 'bg-violet/5' 
            : 'bg-transparent'
        }`}
      />
      
      {/* Visual Accent Divider Line */}
      <div 
        className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 transition-all duration-200 ${
          isDragging 
            ? 'bg-violet shadow-[0_0_10px_#7C3AED]' 
            : isHovered 
            ? 'bg-violet/70 shadow-[0_0_6px_#7C3AED]' 
            : 'bg-border'
        }`}
      />

      {/* Resize Help Tooltip */}
      {isHovered && !isDragging && (
        <div className="absolute top-10 left-4 bg-zinc-900 text-zinc-100 text-3xs font-semibold px-2 py-1 rounded shadow-lg border border-zinc-800/80 whitespace-nowrap pointer-events-none z-30 animate-fade-in">
          Drag to resize
        </div>
      )}
    </div>
  )
}
