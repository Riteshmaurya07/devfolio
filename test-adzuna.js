import fetch from 'node-fetch'

const adzunaId = '4867f3c4'
const adzunaKey = '626472434d043e1075e574309fbbcc84'
const host = 'api.adzuna.com'

async function run() {
  const url = `https://${host}/v1/api/jobs/in/search/1?app_id=${adzunaId}&app_key=${adzunaKey}&what=React%20Developer&where=Kanpur&content-type=application/json`
  console.log('Fetching:', url)
  try {
    const res = await fetch(url)
    console.log('Status:', res.status, res.statusText)
    const text = await res.text()
    console.log('Response (truncated):', text.substring(0, 500))
  } catch (err) {
    console.error('Error:', err)
  }
}

run()
