import { useState, useEffect, useRef, useCallback } from 'react'

export function useResizablePanel({
  minWidth = 320,
  maxWidth = 650,
  defaultWidth = 380,
  minPreviewWidth = 500,
  storageKey = 'resume-editor-width',
} = {}) {
  const [width, setWidth] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? parseInt(saved, 10) : defaultWidth
    } catch {
      return defaultWidth
    }
  })

  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e) => {
      if (!containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()
      
      // Calculate panel width relative to the container X coordinate
      let newWidth = e.clientX - containerRect.left

      // Constrain panel width by absolute boundaries
      newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth))

      // Constrain panel width by ensuring the preview panel has its minimum width
      const maxAllowedWidth = containerRect.width - minPreviewWidth
      if (newWidth > maxAllowedWidth) {
        newWidth = Math.max(minWidth, maxAllowedWidth)
      }

      setWidth(newWidth)
      try {
        localStorage.setItem(storageKey, newWidth.toString())
      } catch (err) {
        console.error('Failed to save resized width:', err)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, minWidth, maxWidth, minPreviewWidth, storageKey])

  // Constrain panel width on container resize to protect the minimum preview area
  useEffect(() => {
    if (!containerRef.current) return

    const handleResize = () => {
      const containerRect = containerRef.current.getBoundingClientRect()
      const maxAllowedWidth = containerRect.width - minPreviewWidth
      setWidth((prev) => {
        let constrained = Math.max(minWidth, Math.min(prev, maxWidth))
        if (constrained > maxAllowedWidth) {
          constrained = Math.max(minWidth, maxAllowedWidth)
        }
        return constrained
      })
    }

    const observer = new ResizeObserver(handleResize)
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [minWidth, maxWidth, minPreviewWidth])

  // Accessibility keyboard support
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      const step = 15
      setWidth((prevWidth) => {
        let newWidth = e.key === 'ArrowLeft' ? prevWidth - step : prevWidth + step
        newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth))
        
        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect()
          const maxAllowedWidth = containerRect.width - minPreviewWidth
          if (newWidth > maxAllowedWidth) {
            newWidth = Math.max(minWidth, maxAllowedWidth)
          }
        }
        
        try {
          localStorage.setItem(storageKey, newWidth.toString())
        } catch (err) {
          console.error(err)
        }
        return newWidth
      })
    }
  }, [minWidth, maxWidth, minPreviewWidth, storageKey])

  return {
    width,
    isDragging,
    containerRef,
    handleMouseDown,
    handleKeyDown,
  }
}
