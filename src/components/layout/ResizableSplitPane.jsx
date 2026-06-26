import { useState, useRef, useEffect } from 'react'
import { useResizablePanel } from '@/hooks/useResizablePanel'
import ResizeHandle from './ResizeHandle'
import { Eye, Edit3 } from 'lucide-react'

export default function ResizableSplitPane({ editor, preview }) {
  const { width, isDragging, containerRef, handleMouseDown, handleKeyDown } = useResizablePanel()
  const [mobileTab, setMobileTab] = useState('edit') // 'edit' or 'preview'
  const [isDesktop, setIsDesktop] = useState(false)
  const previewScrollRef = useRef(null)

  // Track viewport breakpoint in real time
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(media.matches)
    
    const listener = (e) => setIsDesktop(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  const handleScrollToPreview = () => {
    previewScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col lg:flex-row flex-1 overflow-hidden h-full ${
        isDragging ? 'select-none cursor-col-resize' : ''
      }`}
    >
      {/* Mobile Tab Switcher */}
      <div className="md:hidden flex-shrink-0 flex border-b border-border bg-surface px-4 py-2 z-10 no-print">
        <button
          onClick={() => setMobileTab('edit')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'edit'
              ? 'bg-violet text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          type="button"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Edit Details
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'preview'
              ? 'bg-violet text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          type="button"
        >
          <Eye className="w-3.5 h-3.5" />
          View Preview
        </button>
      </div>

      {/* Editor Panel container */}
      <div
        className={`
          ${mobileTab === 'edit' ? 'block' : 'hidden md:block'}
          ${isDesktop ? 'lg:w-auto lg:flex-shrink-0 lg:border-r border-border/40' : 'w-full md:w-full'}
          overflow-y-auto no-scrollbar
          bg-background no-print
          h-full
        `}
        style={{
          width: isDesktop ? `${width}px` : undefined,
        }}
      >
        {/* Tablet smooth scroll helper */}
        <div className="hidden md:block lg:hidden px-6 pt-4 no-print">
          <button
            onClick={handleScrollToPreview}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl bg-violet/5 hover:bg-violet/10 border border-violet/20 text-violet-light transition-all"
            type="button"
          >
            <Eye className="w-4 h-4" />
            Show Preview
          </button>
        </div>

        {editor}
      </div>

      {/* Resize Handle (Desktop only) */}
      {isDesktop && (
        <ResizeHandle
          onMouseDown={handleMouseDown}
          onKeyDown={handleKeyDown}
          isDragging={isDragging}
          valueNow={width}
        />
      )}

      {/* Preview Panel container */}
      <div
        ref={previewScrollRef}
        className={`
          ${mobileTab === 'preview' ? 'block' : 'hidden md:block'}
          ${isDesktop ? 'lg:flex-1 lg:h-full lg:border-t-0' : 'w-full md:w-full h-[450px] sm:h-[550px] md:h-[650px] border-t'}
          no-print overflow-hidden
          border-border/40
        `}
      >
        {preview}
      </div>
    </div>
  )
}
