import { useState, useRef, useEffect } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Download, RotateCcw, Sparkles } from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import ResumeForm from '@/components/resume/ResumeForm'
import ResumePreview from '@/components/resume/ResumePreview'
import Button from '@/components/ui/Button'
import useConnectedAccountsStore from '@/store/connectedAccountsStore'
import useAuthStore from '@/store/authStore'
import toast from 'react-hot-toast'

const STORAGE_KEY = 'devfolio-resume'

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
  const { user } = useAuthStore()
  const { accounts, stats } = useConnectedAccountsStore()

  const [resumeData, setResumeData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      ...defaultData,
      name: user?.name || '',
      email: user?.email || '',
      location: user?.location || '',
      github: user?.html_url || '',
    }
  })

  // Auto-save on every change
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

    // 1. Personal Info
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
      
      // Auto-fill experience if empty
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

      // Auto-fill education if empty
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

    // 2. Skills Compilation
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
    // Add Competitive Programming badges/achievements
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

    // 3. Projects Import from GitHub (if empty)
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

  const githubRepos = stats.github?.repos || []

  return (
    <div className="flex flex-col h-screen">
      {/* Toolbar */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-border bg-surface flex items-center justify-between gap-3 no-print">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Resume Builder</h2>
          <p className="text-2xs text-text-muted">Auto-saved to localStorage</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Sparkles}
            className="border-violet-light/30 bg-violet-light/5 text-violet-light hover:bg-violet-light/10"
            onClick={handleImportFromProfiles}
          >
            Import from Profiles
          </Button>
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleReset}>
            Reset
          </Button>
          <Button size="sm" icon={Download} onClick={handlePrint}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Form */}
        <div className="w-full lg:w-1/2 p-4 overflow-y-auto no-scrollbar border-r border-border no-print">
          <ResumeForm
            data={resumeData}
            onChange={setResumeData}
            githubRepos={githubRepos}
          />
        </div>

        {/* Right: Preview */}
        <div className="hidden lg:flex w-1/2 bg-[#E5E7EB] overflow-auto justify-center py-6 px-4">
          <div className="shadow-2xl">
            <ResumePreview ref={previewRef} data={resumeData} />
          </div>
        </div>
      </div>

      {/* Mobile print button */}
      <div className="lg:hidden p-4 border-t border-border no-print">
        <Button onClick={handlePrint} icon={Download} className="w-full justify-center">
          Export PDF
        </Button>
        <p className="text-xs text-text-muted text-center mt-2">Preview available on desktop</p>
      </div>
    </div>
  )
}
