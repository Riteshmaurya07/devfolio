import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, ExternalLink, Trash2, Calendar, DollarSign, Search, MapPin, Settings, Key, Sparkles, Loader2 } from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import TaskCard from '@/components/kanban/TaskCard'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import useJobStore from '@/store/jobStore'
import useUserDataStore from '@/store/userDataStore'
import useAuthStore from '@/store/authStore'
import { useJobSearch } from '@/hooks/useJobSearch'
import toast from 'react-hot-toast'

const COLUMNS = ['Applied', 'OA', 'Interview', 'Offer', 'Rejected']

function JobCardContent({ job, onDelete }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-1">
        <div>
          <h4 className="text-sm font-semibold text-text-primary">{job.company}</h4>
          <p className="text-xs text-text-secondary">{job.role}</p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(job.id) }} className="text-text-muted hover:text-danger transition-colors flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-2xs text-text-muted">
        {job.ctc && <span className="flex items-center gap-0.5"><DollarSign className="w-3 h-3" />{job.ctc}</span>}
        {job.dateApplied && <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" />{job.dateApplied}</span>}
      </div>
      {job.notes && <p className="text-xs text-text-muted line-clamp-1 italic">{job.notes}</p>}
      {job.jobUrl && (
        <a href={job.jobUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-2xs text-violet-light hover:underline">
          <ExternalLink className="w-3 h-3" /> View JD
        </a>
      )}
    </div>
  )
}

export default function Jobs() {
  const { jobs, addJob, moveJob, reorderJobs, deleteJob, getStats } = useJobStore()
  const { user } = useAuthStore()
  const { languages } = useUserDataStore()

  const [activeTab, setActiveTab] = useState('tracker') // 'tracker' or 'search'
  const [modalOpen, setModalOpen] = useState(false)
  const [targetColumn, setTargetColumn] = useState('Applied')
  const [form, setForm] = useState({
    company: '', role: '', ctc: '',
    dateApplied: new Date().toISOString().split('T')[0],
    notes: '', location: '', jobUrl: '',
  })

  // Detect user languages and location to form default search query
  const topLang = Object.keys(languages || {}).sort((a, b) => languages[b] - languages[a])[0] || ''
  const defaultQuery = topLang ? `${topLang} Developer` : 'React Developer'
  const defaultLoc = user?.location || 'India'

  const [query, setQuery] = useState(defaultQuery)
  const [location, setLocation] = useState(defaultLoc)

  const {
    loading: searchLoading,
    error: searchError,
    jobs: searchResults,
    activeProvider,
    setActiveProvider,
    searchJobs,
  } = useJobSearch()

  // Dynamic credentials from LocalStorage
  const [showSettings, setShowSettings] = useState(false)
  const [localKeys, setLocalKeys] = useState({
    rapidapi: localStorage.getItem('devfolio_rapidapi_key') || '',
    adzunaId: localStorage.getItem('devfolio_adzuna_app_id') || '',
    adzunaKey: localStorage.getItem('devfolio_adzuna_api_key') || '',
  })

  // Tracking modal specific states
  const [trackModalOpen, setTrackModalOpen] = useState(false)
  const [trackForm, setTrackForm] = useState({
    company: '', role: '', ctc: '',
    dateApplied: new Date().toISOString().split('T')[0],
    notes: '', location: '', jobUrl: '',
    column: 'Applied'
  })

  const stats = getStats()

  // Trigger search on tab switch if empty
  useEffect(() => {
    if (activeTab === 'search' && searchResults.length === 0 && !searchLoading) {
      searchJobs(query, location)
    }
  }, [activeTab])

  const handleAdd = (col) => {
    setTargetColumn(col || 'Applied')
    setModalOpen(true)
  }

  const handleSubmit = () => {
    if (!form.company.trim()) { toast.error('Company name required'); return }
    if (!form.role.trim()) { toast.error('Role required'); return }
    addJob(targetColumn, form)
    toast.success('Job added!')
    setModalOpen(false)
    setForm({ company: '', role: '', ctc: '', dateApplied: new Date().toISOString().split('T')[0], notes: '', location: '', jobUrl: '' })
  }

  const handleDelete = (jobId) => {
    for (const col of COLUMNS) {
      if (jobs[col]?.some((j) => j.id === jobId)) {
        deleteJob(jobId, col)
        toast.success('Job removed')
        return
      }
    }
  }

  const handleTrackClick = (job) => {
    setTrackForm({
      company: job.company || '',
      role: job.role || '',
      ctc: job.ctc || '',
      dateApplied: new Date().toISOString().split('T')[0],
      notes: `Imported from ${job.source} search result.`,
      location: job.location || '',
      jobUrl: job.jobUrl || '',
      column: 'Applied'
    })
    setTrackModalOpen(true)
  }

  const handleTrackSubmit = () => {
    if (!trackForm.company.trim()) { toast.error('Company name required'); return }
    if (!trackForm.role.trim()) { toast.error('Role required'); return }
    addJob(trackForm.column, {
      company: trackForm.company,
      role: trackForm.role,
      ctc: trackForm.ctc,
      dateApplied: trackForm.dateApplied,
      notes: trackForm.notes,
      location: trackForm.location,
      jobUrl: trackForm.jobUrl
    })
    toast.success(`Tracking ${trackForm.company} - ${trackForm.role}`)
    setTrackModalOpen(false)
  }

  const handleSaveKeys = () => {
    localStorage.setItem('devfolio_rapidapi_key', localKeys.rapidapi.trim())
    localStorage.setItem('devfolio_adzuna_app_id', localKeys.adzunaId.trim())
    localStorage.setItem('devfolio_adzuna_api_key', localKeys.adzunaKey.trim())
    toast.success('API keys saved successfully!')
    setShowSettings(false)
    // Retry search with new keys
    searchJobs(query, location)
  }

  return (
    <PageWrapper>
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Applied', value: stats.total, color: 'text-blue-400', icon: '📤' },
          { label: 'Interviews', value: stats.interviews, color: 'text-violet-light', icon: '🎙️' },
          { label: 'Offers', value: stats.offers, color: 'text-success', icon: '🎉' },
          { label: 'Success Rate', value: `${stats.successRate}%`, color: 'text-warning', icon: '📈' },
        ].map(({ label, value, color, icon }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center"
          >
            <span className="text-xl">{icon}</span>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            <p className="text-xs text-text-muted">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-primary mt-6">
        <button
          onClick={() => setActiveTab('tracker')}
          className={`px-4 py-2 font-semibold text-sm transition-colors relative ${
            activeTab === 'tracker' ? 'text-violet-light font-bold' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Job Pipeline Tracker
          {activeTab === 'tracker' && (
            <motion.div layoutId="jobActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-light" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 font-semibold text-sm transition-colors relative flex items-center gap-1.5 ${
            activeTab === 'search' ? 'text-violet-light font-bold' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Sparkles className="w-4 h-4 text-violet-light" />
          Search Live Jobs
          {activeTab === 'search' && (
            <motion.div layoutId="jobActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-light" />
          )}
        </button>
      </div>

      {activeTab === 'tracker' ? (
        <>
          {/* Controls */}
          <div className="flex items-center justify-between mt-6">
            <h2 className="text-lg font-semibold text-text-primary">Job Pipeline</h2>
            <Button icon={Plus} onClick={() => handleAdd('Applied')}>Add Job</Button>
          </div>

          {/* Kanban */}
          <KanbanBoard
            columns={COLUMNS}
            items={jobs}
            onMove={(id, from, to) => { moveJob(id, from, to); toast.success(`Moved to ${to}`) }}
            onReorder={reorderJobs}
            onAddItem={handleAdd}
            renderCard={(job) => (
              <TaskCard key={job.id} item={job}>
                <JobCardContent job={job} onDelete={handleDelete} />
              </TaskCard>
            )}
          />
        </>
      ) : (
        <div className="space-y-4 mt-6">
          {/* Search Controls */}
          <div className="card space-y-4">
            <div className="flex flex-col lg:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="label">Keywords / Skills</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    className="input pl-10"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. React, Node, Frontend"
                    onKeyDown={(e) => e.key === 'Enter' && searchJobs(query, location)}
                  />
                </div>
              </div>

              <div className="w-full lg:w-64">
                <label className="label">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    className="input pl-10"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. India, Remote, Bangalore"
                    onKeyDown={(e) => e.key === 'Enter' && searchJobs(query, location)}
                  />
                </div>
              </div>

              <div className="w-full lg:w-56">
                <label className="label">API Provider</label>
                <select
                  className="input"
                  value={activeProvider}
                  onChange={(e) => setActiveProvider(e.target.value)}
                >
                  <option value="mock">Demo Mode (Naukri / Indeed / Foundit)</option>
                  <option value="remotive">Remotive API (Keyless Remote)</option>
                  <option value="jsearch">JSearch (Indeed + LinkedIn + Monster)</option>
                  <option value="adzuna">Adzuna API (India / Global)</option>
                </select>
              </div>

              <div className="flex gap-2 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className={`btn p-2.5 rounded-lg border border-border-primary bg-background-secondary transition-colors ${showSettings ? 'border-violet-light bg-violet-light/5 text-violet-light' : 'text-text-muted hover:text-text-primary'}`}
                  title="Configure API Keys"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <Button
                  onClick={() => searchJobs(query, location)}
                  loading={searchLoading}
                  className="flex-1 lg:flex-none justify-center h-10 px-5"
                >
                  Find Jobs
                </Button>
              </div>
            </div>

            {/* API Settings Section */}
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-background-secondary border border-border-primary space-y-4"
              >
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Key className="w-4 h-4 text-violet-light" /> Configure Job API Keys
                </h3>
                <p className="text-xs text-text-muted">
                  Provide credentials for the APIs. Keys are saved in your browser local storage.
                  <br />
                  • <strong>JSearch</strong>: Get a key from <a href="https://rapidapi.com/letscrape-65165217/api/jsearch" target="_blank" rel="noreferrer" className="text-violet-light hover:underline">RapidAPI JSearch</a>.
                  <br />
                  • <strong>Adzuna</strong>: Get app ID/key at <a href="https://developer.adzuna.com" target="_blank" rel="noreferrer" className="text-violet-light hover:underline">Adzuna Developers Portal</a>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="label text-2xs">JSearch RapidAPI Key</label>
                    <input
                      type="password"
                      className="input text-xs h-9"
                      value={localKeys.rapidapi}
                      onChange={(e) => setLocalKeys({ ...localKeys, rapidapi: e.target.value })}
                      placeholder="e.g. 52c803f295msh..."
                    />
                  </div>
                  <div>
                    <label className="label text-2xs">Adzuna App ID</label>
                    <input
                      className="input text-xs h-9"
                      value={localKeys.adzunaId}
                      onChange={(e) => setLocalKeys({ ...localKeys, adzunaId: e.target.value })}
                      placeholder="e.g. 841f4dcd"
                    />
                  </div>
                  <div>
                    <label className="label text-2xs">Adzuna API Key</label>
                    <input
                      type="password"
                      className="input text-xs h-9"
                      value={localKeys.adzunaKey}
                      onChange={(e) => setLocalKeys({ ...localKeys, adzunaKey: e.target.value })}
                      placeholder="e.g. c3d94182b..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 text-xs pt-1">
                  <Button variant="ghost" className="h-8 px-3" onClick={() => setShowSettings(false)}>Cancel</Button>
                  <Button className="h-8 px-3" onClick={handleSaveKeys}>Save Credentials</Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Results Grid */}
          {searchLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card h-48 flex flex-col justify-between animate-pulse">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-5 w-24 rounded bg-border-primary" />
                      <div className="h-5 w-16 rounded bg-border-primary" />
                    </div>
                    <div className="h-6 w-2/3 rounded bg-border-primary mt-2" />
                    <div className="h-4 w-1/3 rounded bg-border-primary" />
                    <div className="h-10 w-full rounded bg-border-primary/50 mt-4" />
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="h-4 w-32 rounded bg-border-primary" />
                    <div className="h-8 w-20 rounded bg-border-primary" />
                  </div>
                </div>
              ))}
            </div>
          ) : searchError ? (
            <div className="card border border-red-500/20 bg-red-500/5 p-6 text-center space-y-3">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-base font-semibold text-red-400">Search Failed</h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto">{searchError}</p>
              <Button variant="ghost" onClick={() => setShowSettings(true)} className="mx-auto mt-2">
                <Key className="w-4 h-4 mr-1.5" /> Check API Keys
              </Button>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="card text-center p-12 space-y-3 border border-dashed border-border-primary">
              <div className="w-12 h-12 rounded-full bg-violet-light/10 flex items-center justify-center mx-auto text-violet-light">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">No live jobs found</h3>
              <p className="text-sm text-text-muted max-w-sm mx-auto">
                Try searching for another role or location, or select "Demo Mode (Mock Jobs)" to browse offline examples.
              </p>
              <Button onClick={() => searchJobs(query, location)} className="mx-auto mt-2">
                Search Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((job) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card group hover:shadow-violet-light/5 hover:border-violet-light/30 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-violet-light/10 text-violet-light border border-violet-light/20">
                            {job.source}
                          </span>
                          {job.ctc && (
                            <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-success/10 text-success border border-success/20">
                              {job.ctc}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-text-primary mt-1.5 group-hover:text-violet-light transition-colors">
                          {job.role}
                        </h3>
                        <p className="text-sm text-text-secondary font-medium">{job.company}</p>
                      </div>
                      {job.logoUrl && (
                        <img
                          src={job.logoUrl}
                          alt={job.company}
                          className="w-10 h-10 object-contain rounded bg-white p-1"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      )}
                    </div>

                    <p className="text-xs text-text-muted line-clamp-3 leading-relaxed">
                      {job.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border-primary flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 text-text-muted">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                      {job.datePosted && <span>Posted: {job.datePosted}</span>}
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      {job.jobUrl && (
                        <a
                          href={job.jobUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-ghost px-2.5 h-8 flex items-center gap-1 text-text-muted hover:text-text-primary"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View JD
                        </a>
                      )}
                      <Button
                        onClick={() => handleTrackClick(job)}
                        className="py-1 px-3 h-8 text-xs font-semibold bg-violet-light hover:bg-violet-dark text-white rounded"
                      >
                        Track Job
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Job Modal (Manual) */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Add Job Manual — ${targetColumn}`}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Company *</label>
              <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Google" />
            </div>
            <div>
              <label className="label">Role *</label>
              <input className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="SDE II" />
            </div>
            <div>
              <label className="label">CTC / Salary</label>
              <input className="input" value={form.ctc} onChange={(e) => setForm({ ...form, ctc: e.target.value })} placeholder="₹25 LPA or $150K" />
            </div>
            <div>
              <label className="label">Date Applied</label>
              <input type="date" className="input" value={form.dateApplied} onChange={(e) => setForm({ ...form, dateApplied: e.target.value })} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote / Bangalore" />
            </div>
            <div>
              <label className="label">Job URL</label>
              <input className="input" value={form.jobUrl} onChange={(e) => setForm({ ...form, jobUrl: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Referral from John, HM: Jane..." />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Add Job</Button>
          </div>
        </div>
      </Modal>

      {/* Track Job Modal (From API search) */}
      <Modal isOpen={trackModalOpen} onClose={() => setTrackModalOpen(false)} title="Import Job to Tracker">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Company *</label>
              <input className="input" value={trackForm.company} onChange={(e) => setTrackForm({ ...trackForm, company: e.target.value })} placeholder="Google" />
            </div>
            <div>
              <label className="label">Role *</label>
              <input className="input" value={trackForm.role} onChange={(e) => setTrackForm({ ...trackForm, role: e.target.value })} placeholder="SDE II" />
            </div>
            <div>
              <label className="label">Pipeline Status</label>
              <select
                className="input text-sm"
                value={trackForm.column}
                onChange={(e) => setTrackForm({ ...trackForm, column: e.target.value })}
              >
                {COLUMNS.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">CTC / Salary</label>
              <input className="input" value={trackForm.ctc} onChange={(e) => setTrackForm({ ...trackForm, ctc: e.target.value })} placeholder="₹25 LPA" />
            </div>
            <div>
              <label className="label">Date Applied</label>
              <input type="date" className="input" value={trackForm.dateApplied} onChange={(e) => setTrackForm({ ...trackForm, dateApplied: e.target.value })} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" value={trackForm.location} onChange={(e) => setTrackForm({ ...trackForm, location: e.target.value })} placeholder="Remote / Bangalore" />
            </div>
            <div className="col-span-2">
              <label className="label">Job URL</label>
              <input className="input" value={trackForm.jobUrl} onChange={(e) => setTrackForm({ ...trackForm, jobUrl: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input resize-none"
              rows={2}
              value={trackForm.notes}
              onChange={(e) => setTrackForm({ ...trackForm, notes: e.target.value })}
              placeholder="Add any comments or notes here..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setTrackModalOpen(false)}>Cancel</Button>
            <Button onClick={handleTrackSubmit}>Track Job</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  )
}
