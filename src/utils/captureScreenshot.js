import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'

export async function captureAndShare(elementRef, filename = 'devfolio-compare.png') {
  if (!elementRef?.current) return

  try {
    toast.loading('Capturing screenshot...', { id: 'screenshot' })

    const canvas = await html2canvas(elementRef.current, {
      backgroundColor: '#0A0A0B',
      scale: 2, // Retina quality
      useCORS: true,
      allowTaint: true,
      logging: false,
    })

    const dataUrl = canvas.toDataURL('image/png')

    // Download the image
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    link.click()

    toast.success('Screenshot saved! Share on LinkedIn 🚀', { id: 'screenshot' })
    return dataUrl
  } catch (error) {
    toast.error('Failed to capture screenshot', { id: 'screenshot' })
    console.error('Screenshot error:', error)
    return null
  }
}

export async function copyImageToClipboard(elementRef) {
  if (!elementRef?.current) return

  try {
    const canvas = await html2canvas(elementRef.current, {
      backgroundColor: '#0A0A0B',
      scale: 2,
      useCORS: true,
    })

    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ])
        toast.success('Image copied to clipboard!')
      } catch {
        toast.error('Clipboard copy not supported in this browser')
      }
    })
  } catch (error) {
    toast.error('Failed to capture image')
  }
}
