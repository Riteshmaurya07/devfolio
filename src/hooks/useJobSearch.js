import { useState, useCallback } from 'react'

const MOCK_JOBS = [
  {
    id: 'mock_1',
    company: 'Google',
    role: 'Senior Frontend Engineer',
    location: 'Bangalore / Remote',
    ctc: '₹35 - ₹55 LPA',
    jobUrl: 'https://careers.google.com',
    source: 'Indeed',
    datePosted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Looking for a Senior Frontend Engineer with 5+ years of experience in React, TypeScript, and modern web performance optimization. You will work on next-gen productivity tools.',
    logoUrl: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'
  },
  {
    id: 'mock_2',
    company: 'Zomato',
    role: 'React Developer',
    location: 'Gurugram, India',
    ctc: '₹18 - ₹28 LPA',
    jobUrl: 'https://www.zomato.com/careers',
    source: 'Naukri.com',
    datePosted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'We are hiring React Developers to build responsive, fast-loading user interfaces for our online food ordering platform. Expertise in Tailwind CSS and Redux is a plus.',
    logoUrl: ''
  },
  {
    id: 'mock_3',
    company: 'Razorpay',
    role: 'Full Stack Engineer (Node + React)',
    location: 'Bangalore, India',
    ctc: '₹22 - ₹32 LPA',
    jobUrl: 'https://razorpay.com/jobs',
    source: 'Foundit',
    datePosted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Join our checkout platform team. You will build and scale high-performance checkout UI widgets and robust Node.js backend microservices handling millions of API requests daily.',
    logoUrl: ''
  },
  {
    id: 'mock_4',
    company: 'Microsoft',
    role: 'Software Engineer II (React/C#)',
    location: 'Hyderabad / Remote',
    ctc: '₹30 - ₹45 LPA',
    jobUrl: 'https://careers.microsoft.com',
    source: 'Indeed',
    datePosted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Work on Microsoft 365 web application interfaces using React, Fluent UI, and C# backend services. Strong computer science fundamentals and system design skills required.',
    logoUrl: ''
  },
  {
    id: 'mock_5',
    company: 'TCS',
    role: 'Frontend Developer',
    location: 'Pune, India',
    ctc: '₹6 - ₹10 LPA',
    jobUrl: 'https://www.tcs.com/careers',
    source: 'Naukri.com',
    datePosted: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Required: ReactJS developer with 2-4 years of experience. Candidate should be proficient in HTML5, CSS3, Javascript, ES6, and State Management using Redux/Context API.',
    logoUrl: ''
  },
  {
    id: 'mock_6',
    company: 'CRED',
    role: 'UI Engineer (React / React Native)',
    location: 'Bangalore, India',
    ctc: '₹25 - ₹40 LPA',
    jobUrl: 'https://cred.club/careers',
    source: 'LinkedIn',
    datePosted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Build gorgeous, high-fidelity UI animations and layouts for the CRED application on mobile and web. Seeking pixel-perfect implementation skills and high aesthetic taste.',
    logoUrl: ''
  },
  {
    id: 'mock_7',
    company: 'Infosys',
    role: 'Technology Analyst - ReactJS',
    location: 'Noida, India',
    ctc: '₹8 - ₹12 LPA',
    jobUrl: 'https://www.infosys.com/careers',
    source: 'Foundit',
    datePosted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Deliver high quality code for client engagements. Lead frontend modules, guide junior developers, and ensure adherence to best practices for code quality and UI performance.',
    logoUrl: ''
  },
  {
    id: 'mock_8',
    company: 'Stripe',
    role: 'Frontend Engineer - Payments UI',
    location: 'Remote (US/Global)',
    ctc: '$140,000 - $180,000',
    jobUrl: 'https://stripe.com/jobs',
    source: 'Indeed',
    datePosted: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Help build the dashboard UI and SDK widgets that power online commerce globally. Strong JS/TS expertise and deep understanding of modern CSS/HTML required.',
    logoUrl: ''
  }
]

// Helper to guess country code for Adzuna
const getAdzunaCountryCode = (locationStr) => {
  const loc = (locationStr || '').toLowerCase().trim()
  if (!loc) return 'in' // Default to India
  if (loc.includes('india') || loc.includes('bangalore') || loc.includes('bengaluru') || loc.includes('mumbai') || loc.includes('delhi') || loc.includes('hyderabad') || loc.includes('pune') || loc.includes('chennai') || loc.includes('noida') || loc.includes('gurugram')) {
    return 'in'
  }
  if (loc.includes('us') || loc.includes('united states') || loc.includes('america') || loc.includes('california') || loc.includes('new york')) {
    return 'us'
  }
  if (loc.includes('uk') || loc.includes('united kingdom') || loc.includes('london') || loc.includes('gb')) {
    return 'gb'
  }
  if (loc.includes('canada') || loc.includes('toronto') || loc.includes('vancouver') || loc.includes('ca')) {
    return 'ca'
  }
  if (loc.includes('australia') || loc.includes('sydney') || loc.includes('melbourne') || loc.includes('au')) {
    return 'au'
  }
  return 'in' // Default to India
}

export function useJobSearch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [jobs, setJobs] = useState([])
  const [activeProvider, setActiveProvider] = useState('mock') // 'mock', 'remotive', 'jsearch', 'adzuna'

  // Retrieve keys from LocalStorage or Vite Env
  const getApiKeys = useCallback(() => {
    return {
      rapidapi: localStorage.getItem('devfolio_rapidapi_key') || import.meta.env.VITE_RAPIDAPI_KEY || '',
      adzunaId: localStorage.getItem('devfolio_adzuna_app_id') || import.meta.env.VITE_ADZUNA_APP_ID || '',
      adzunaKey: localStorage.getItem('devfolio_adzuna_api_key') || import.meta.env.VITE_ADZUNA_API_KEY || '',
    }
  }, [])

  const searchJobs = useCallback(async (query, location) => {
    setLoading(true)
    setError(null)
    setJobs([])

    const keys = getApiKeys()
    const q = query ? query.trim() : 'React Developer'
    const loc = location ? location.trim() : 'India'

    try {
      if (activeProvider === 'mock') {
        // Filter mock jobs by query & location
        await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate network latency
        const filtered = MOCK_JOBS.filter((job) => {
          const mQuery = q.toLowerCase()
          const mLoc = loc.toLowerCase()
          const matchesQuery = job.company.toLowerCase().includes(mQuery) ||
                               job.role.toLowerCase().includes(mQuery) ||
                               job.description.toLowerCase().includes(mQuery)
          const matchesLoc = job.location.toLowerCase().includes(mLoc)
          return matchesQuery && matchesLoc
        })

        // If no filter match, return all mock jobs to not look completely blank
        setJobs(filtered.length > 0 ? filtered : MOCK_JOBS)
      } else if (activeProvider === 'remotive') {
        const res = await fetch(`/remotive-api/remote-jobs?search=${encodeURIComponent(q)}`)
        if (!res.ok) throw new Error(`Remotive API responded with status ${res.status}`)
        const data = await res.json()
        
        if (data.jobs && Array.isArray(data.jobs)) {
          const mapped = data.jobs.map((j) => ({
            id: `remotive_${j.id}`,
            company: j.company_name,
            role: j.title,
            location: j.candidate_required_location || 'Remote',
            ctc: j.salary || 'Remote Compensation',
            jobUrl: j.url,
            source: 'Remotive',
            datePosted: j.publication_date ? j.publication_date.split('T')[0] : new Date().toISOString().split('T')[0],
            description: j.description ? j.description.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : '',
            logoUrl: j.company_logo || ''
          }))
          setJobs(mapped)
        } else {
          setJobs([])
        }
      } else if (activeProvider === 'jsearch') {
        if (!keys.rapidapi || keys.rapidapi.includes('your_')) {
          throw new Error('RapidAPI Key is required for JSearch. Set VITE_RAPIDAPI_KEY in .env or configure in settings.')
        }

        const fullQuery = `${q} in ${loc}`
        const res = await fetch(`/jsearch-api/search?query=${encodeURIComponent(fullQuery)}&num_pages=1`, {
          headers: {
            'X-RapidAPI-Key': keys.rapidapi,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
          }
        })
        if (!res.ok) throw new Error(`JSearch API responded with status ${res.status}`)
        const json = await res.json()

        if (json.data && Array.isArray(json.data)) {
          const mapped = json.data.map((j) => {
            // Build salary details string
            let salaryStr = ''
            if (j.job_min_salary && j.job_max_salary) {
              const symbol = j.job_salary_currency === 'INR' ? '₹' : (j.job_salary_currency === 'USD' ? '$' : j.job_salary_currency + ' ')
              salaryStr = `${symbol}${j.job_min_salary.toLocaleString()} - ${symbol}${j.job_max_salary.toLocaleString()} / ${j.job_salary_period || 'year'}`
            } else if (j.job_min_salary) {
              const symbol = j.job_salary_currency === 'INR' ? '₹' : (j.job_salary_currency === 'USD' ? '$' : j.job_salary_currency + ' ')
              salaryStr = `${symbol}${j.job_min_salary.toLocaleString()} / ${j.job_salary_period || 'year'}`
            }

            // Location
            const locationParts = [j.job_city, j.job_state, j.job_country].filter(Boolean)
            const jobLocation = locationParts.join(', ') || 'Remote/Not Specified'

            return {
              id: `jsearch_${j.job_id}`,
              company: j.employer_name,
              role: j.job_title,
              location: jobLocation,
              ctc: salaryStr,
              jobUrl: j.job_apply_link,
              source: j.job_publisher || 'Indeed / LinkedIn',
              datePosted: j.job_posted_at_datetime_utc ? j.job_posted_at_datetime_utc.split('T')[0] : new Date().toISOString().split('T')[0],
              description: j.job_description ? j.job_description.substring(0, 200) + '...' : '',
              logoUrl: j.employer_logo || ''
            }
          })
          setJobs(mapped)
        } else {
          setJobs([])
        }
      } else if (activeProvider === 'adzuna') {
        if (!keys.adzunaId || !keys.adzunaKey || keys.adzunaId.includes('your_') || keys.adzunaKey.includes('your_')) {
          throw new Error('Adzuna App ID and Key are required. Set them in .env or configure in settings.')
        }

        const country = getAdzunaCountryCode(loc)
        const url = `/adzuna-api/v1/api/jobs/${country}/search/1?app_id=${keys.adzunaId}&app_key=${keys.adzunaKey}&what=${encodeURIComponent(q)}&where=${encodeURIComponent(loc)}&content-type=application/json`
        
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Adzuna API responded with status ${res.status}`)
        const data = await res.json()

        if (data.results && Array.isArray(data.results)) {
          const mapped = data.results.map((j) => {
            let salaryStr = ''
            if (j.salary_min && j.salary_max) {
              const currency = country === 'in' ? '₹' : (country === 'us' ? '$' : '£')
              salaryStr = `${currency}${Math.round(j.salary_min).toLocaleString()} - ${currency}${Math.round(j.salary_max).toLocaleString()} / yr`
            } else if (j.salary_min) {
              const currency = country === 'in' ? '₹' : (country === 'us' ? '$' : '£')
              salaryStr = `${currency}${Math.round(j.salary_min).toLocaleString()} / yr`
            }

            return {
              id: `adzuna_${j.id}`,
              company: j.company?.display_name || 'Confidential Company',
              role: j.title ? j.title.replace(/<\/?[^>]+(>|$)/g, "") : 'Job Posting',
              location: j.location?.display_name || 'India',
              ctc: salaryStr,
              jobUrl: j.redirect_url,
              source: 'Adzuna Aggregator',
              datePosted: j.created ? j.created.split('T')[0] : new Date().toISOString().split('T')[0],
              description: j.description ? j.description.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 200) + '...' : '',
              logoUrl: ''
            }
          })
          setJobs(mapped)
        } else {
          setJobs([])
        }
      }
    } catch (err) {
      console.error('Job Search API Error:', err)
      setError(err.message || 'Failed to fetch jobs. Please check network and API keys.')
    } finally {
      setLoading(false)
    }
  }, [activeProvider, getApiKeys])

  return {
    loading,
    error,
    jobs,
    activeProvider,
    setActiveProvider,
    searchJobs,
    apiKeys: getApiKeys()
  }
}
