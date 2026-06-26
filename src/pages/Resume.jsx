import { useState, useRef, useEffect } from 'react'
import { useReactToPrint } from 'react-to-print'
import { 
  Download, 
  RotateCcw, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  RefreshCw
} from 'lucide-react'
import ResumeForm from '@/components/resume/ResumeForm'
import ResumePreview from '@/components/resume/ResumePreview'
import Button from '@/components/ui/Button'
import ResizableSplitPane from '@/components/layout/ResizableSplitPane'
import useConnectedAccountsStore from '@/store/connectedAccountsStore'
import useAuthStore from '@/store/authStore'
import toast from 'react-hot-toast'

const STORAGE_KEY = 'devfolio-resume'
const A4_WIDTH = 794
const A4_HEIGHT = 1123
const PADDING = 48

const defaultData = {
  name: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  github: '',
  linkedin: '',
  portfolio: '',
  summary: '',
  skills: '',
  experience: [],
  projects: [],
  education: [],
}

export default function Resume() {
  const previewRef = useRef(null)
  const canvasContainerRef = useRef(null)
  
  const { user } = useAuthStore()
  const { accounts, stats } = useConnectedAccountsStore()
  
  const [zoom, setZoom] = useState(1.0)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [hasAutoZoomed, setHasAutoZoomed] = useState(false)

  const [resumeData, setResumeData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    return {
      ...defaultData,
      name: user?.name || '',
      email: user?.email || '',
      location: user?.location || '',
      github: user?.html_url || '',
    }
  })

  // Measure canvas container size dynamically using ResizeObserver
  useEffect(() => {
    if (!canvasContainerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })
    resizeObserver.observe(canvasContainerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Auto-fit page scale once container dimensions are resolved
  useEffect(() => {
    if (containerSize.width > 100 && containerSize.height > 100 && !hasAutoZoomed) {
      const scaleX = (containerSize.width - PADDING) / A4_WIDTH
      const scaleY = (containerSize.height - PADDING) / A4_HEIGHT
      setZoom(Math.max(0.15, Math.min(scaleX, scaleY)))
      setHasAutoZoomed(true)
    }
  }, [containerSize, hasAutoZoomed])

  // Auto-save resumeData updates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData))
  }, [resumeData])

  const handlePrint = useReactToPrint({
    content: () => previewRef.current,
    documentTitle: `${resumeData.name || 'Resume'}_Resume`,
    pageStyle: `
      @page { size: A4; margin: 0; }
      @media print {
        body { background: white !important; }
        .no-print { display: none !important; }
      }
    `,
    onAfterPrint: () => toast.success('Resume exported as PDF!'),
  })

  const handleReset = () => {
    if (confirm('Reset resume? This will clear all fields.')) {
      setResumeData({ ...defaultData, name: user?.name || '' })
      localStorage.removeItem(STORAGE_KEY)
      toast.success('Resume reset')
    }
  }

  const handleImportFromProfiles = () => {
    const hasGitHub = accounts.github?.connected && stats.github
    const hasLinkedIn = accounts.linkedin?.connected && stats.linkedin

    if (!hasGitHub && !hasLinkedIn) {
      toast.error('Please connect your GitHub or LinkedIn profiles in Settings first.')
      return
    }

    const updated = { ...resumeData }

    if (hasGitHub) {
      const gh = stats.github
      if (!updated.name) updated.name = gh.profile?.name || user?.name || ''
      if (!updated.location) updated.location = gh.profile?.location || ''
      if (!updated.github) updated.github = gh.profile?.html_url || `https://github.com/${gh.profile?.login}`
      if (!updated.summary) updated.summary = gh.profile?.bio || ''
    }

    if (hasLinkedIn) {
      const li = stats.linkedin
      if (!updated.linkedin) updated.linkedin = `https://linkedin.com/in/${accounts.linkedin.username}`
      
      if (li.experience && li.experience.length > 0 && updated.experience.length === 0) {
        updated.experience = li.experience.map((exp, idx) => {
          const durationParts = exp.duration ? exp.duration.split(' - ') : ['']
          return {
            id: Date.now() + idx + Math.random(),
            company: exp.company || '',
            role: exp.role || '',
            start: durationParts[0] || '',
            end: durationParts[1] || '',
            highlights: '',
          }
        })
      }

      if (li.education && li.education.length > 0 && updated.education.length === 0) {
        updated.education = li.education.map((edu, idx) => ({
          id: Date.now() + idx + Math.random(),
          institution: edu.school || '',
          degree: edu.degree || '',
          year: edu.year || '',
          gpa: '',
        }))
      }
    }

    const skillList = []
    if (hasGitHub && stats.github.languages) {
      Object.keys(stats.github.languages).slice(0, 5).forEach((l) => {
        if (!skillList.includes(l)) skillList.push(l)
      })
    }
    if (hasLinkedIn && stats.linkedin.skills) {
      stats.linkedin.skills.forEach((s) => {
        if (!skillList.includes(s)) skillList.push(s)
      })
    }
    if (accounts.leetcode?.connected && stats.leetcode?.totalSolved) {
      skillList.push(`LeetCode (${stats.leetcode.totalSolved} solved)`)
    }
    if (accounts.codeforces?.connected && stats.codeforces?.currentRating) {
      skillList.push(`Codeforces (Rating: ${stats.codeforces.currentRating})`)
    }

    if (skillList.length > 0) {
      const existingSkills = updated.skills ? updated.skills.split(',').map((s) => s.trim()) : []
      skillList.forEach((s) => {
        if (!existingSkills.includes(s)) existingSkills.push(s)
      })
      updated.skills = existingSkills.join(', ')
    }

    if (hasGitHub && stats.github.repos && updated.projects.length === 0) {
      updated.projects = stats.github.repos.slice(0, 4).map((repo, idx) => ({
        id: Date.now() + idx + Math.random(),
        name: repo.name,
        tech: repo.language || '',
        link: repo.html_url,
        description: repo.description || `GitHub repository for ${repo.name}. Stars: ${repo.stargazers_count || 0}`,
      }))
    }

    setResumeData(updated)
    toast.success('Successfully imported data from connected profiles! ⚡')
  }

  // Zoom options math
  const handleZoomIn = () => setZoom(z => Math.min(2.0, z + 0.1))
  const handleZoomOut = () => setZoom(z => Math.max(0.15, z - 0.1))
  const handleResetZoom = () => setZoom(1.0)
  
  const handleFitPage = () => {
    if (containerSize.width === 0 || containerSize.height === 0) return
    const scaleX = (containerSize.width - PADDING) / A4_WIDTH
    const scaleY = (containerSize.height - PADDING) / A4_HEIGHT
    setZoom(Math.max(0.15, Math.min(scaleX, scaleY)))
  }

  const handleFitWidth = () => {
    if (containerSize.width === 0) return
    const scaleX = (containerSize.width - PADDING) / A4_WIDTH
    setZoom(Math.max(0.15, scaleX))
  }

  const githubRepos = stats.github?.repos || []

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Top Navbar */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-surface flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 no-print">
        <div>
          <h2 className="text-base font-bold text-text-primary">Resume Builder</h2>
          <p className="text-xs text-text-muted">Create your print-ready portfolio resume</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Sparkles}
            className="border-violet-light/30 bg-violet-light/5 text-violet-light hover:bg-violet-light/10 text-xs"
            onClick={handleImportFromProfiles}
          >
            Import from Profiles
          </Button>
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleReset} className="text-xs">
            Reset
          </Button>
          <Button size="sm" icon={Download} onClick={handlePrint} className="text-xs">
            Export PDF
          </Button>
        </div>
      </div>

      {/* Draggable resizable split container */}
      <ResizableSplitPane
        editor={
          <div className="p-5 sm:p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-text-primary mb-1">Editor Panel</h3>
              <p className="text-2xs text-text-muted">Changes are saved in real-time</p>
            </div>
            <ResumeForm
              data={resumeData}
              onChange={setResumeData}
              githubRepos={githubRepos}
            />
          </div>
        }
        preview={
          <div className="w-full h-full bg-[#121214] flex flex-col relative no-print overflow-hidden">
            {/* Zoom & Canvas Toolbar */}
            <div className="flex-shrink-0 px-4 py-2 border-b border-border/40 bg-zinc-900/90 backdrop-blur-md flex items-center justify-between gap-3 z-10">
              <span className="text-2xs font-bold text-zinc-400 uppercase tracking-wider">Resume Preview</span>
              
              <div className="flex items-center gap-1.5 text-zinc-300">
                <button 
                  onClick={handleZoomOut} 
                  className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                
                <span className="text-3xs font-semibold w-10 text-center select-none text-zinc-400">
                  {Math.round(zoom * 100)}%
                </span>
                
                <button 
                  onClick={handleZoomIn} 
                  className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                
                <div className="w-px h-3.5 bg-zinc-800 mx-1" />
                
                <button 
                  onClick={handleFitWidth} 
                  className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-1 text-3xs font-medium"
                  title="Fit Width"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Fit Width</span>
                </button>
                
                <button 
                  onClick={handleFitPage} 
                  className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-1 text-3xs font-medium"
                  title="Fit Page"
                >
                  <Minimize2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Fit Page</span>
                </button>

                <button 
                  onClick={handleResetZoom} 
                  className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-1 text-3xs font-medium"
                  title="Reset Zoom"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>

            {/* Interactive Scaled Canvas Container */}
            <div 
              ref={canvasContainerRef}
              className="flex-1 overflow-auto p-8 sm:p-10 flex justify-center items-start no-scrollbar"
              style={{ backgroundColor: '#18181b' }}
            >
              <div
                style={{
                  width: `${A4_WIDTH * zoom}px`,
                  height: `${A4_HEIGHT * zoom}px`,
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'width 0.15s ease-out, height 0.15s ease-out',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    width: `${A4_WIDTH}px`,
                    height: `${A4_HEIGHT}px`,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Print area container */}
                  <div ref={previewRef} className="w-full h-full">
                    <ResumePreview data={resumeData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      />
    </div>
  )
}
