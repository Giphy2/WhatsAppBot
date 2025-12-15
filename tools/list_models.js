require('dotenv').config()

const { GoogleGenerativeAI } = require('@google/generative-ai')

async function listModels() {
  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY
    if (!apiKey) {
      console.error('No GOOGLE_GENAI_API_KEY found in environment (.env)')
      process.exit(1)
    }

    const client = new GoogleGenerativeAI(apiKey)
    const res = await client.listModels()
    console.log('Models response:')
    require('dotenv').config()
    const fetch = global.fetch || require('node-fetch')

    async function listGoogleGenModels() {
      const apiKey = process.env.GOOGLE_GENAI_API_KEY
      if (!apiKey) {
        console.error('No GOOGLE_GENAI_API_KEY found in environment (.env)')
        process.exit(1)
      }

      // Try REST API listing. Note: Some Google GenAI setups require OAuth access tokens
      // (service account) rather than a simple API key. This endpoint accepts ?key=API_KEY
      // for some project configurations.
      const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`

      try {
        const res = await fetch(url, { method: 'GET' })
        const text = await res.text()
        if (!res.ok) {
          console.error(`HTTP ${res.status} from Generative API:`)
          console.error(text)
          console.error('\nIf you get 401/403, your API key may not be valid for this API.\n' +
            'Try authenticating with a service account token (run `gcloud auth application-default print-access-token`)\n' +
            'or use Hugging Face Inference as a fallback by setting HUGGINGFACE_API_KEY in your .env.')
          process.exit(1)
        }

        const json = JSON.parse(text)
        if (!json.models) {
          console.log('Response (no models field):')
          console.dir(json, { depth: null })
          return
        }

        console.log('Available models:')
        for (const m of json.models) {
          console.log('-', m.name || m.model || JSON.stringify(m))
        }
      } catch (err) {
        console.error('Error fetching models from Google Generative API:', err)
        process.exit(1)
      }
    }

    async function listHuggingFaceModels() {
      const hfKey = process.env.HUGGINGFACE_API_KEY
      if (!hfKey) {
        console.error('No HUGGINGFACE_API_KEY found in environment (.env)')
        return
      }

      // Hugging Face provides a models listing endpoint
      const url = 'https://api-inference.huggingface.co/models'
      try {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${hfKey}` } })
        if (!res.ok) {
          console.error('HF models list error', res.status)
          const t = await res.text()
          console.error(t)
          return
        }
        const json = await res.json()
        console.log('Hugging Face models (first 50):')
        for (let i = 0; i < Math.min(50, json.length); i++) {
          console.log('-', json[i].modelId || json[i].id || JSON.stringify(json[i]))
        }
      } catch (err) {
        console.error('Error fetching models from Hugging Face:', err)
      }
    }

    // Main: prefer Google GenAI listing if GOOGLE_GENAI_API_KEY is present, otherwise try HF
    ;(async () => {
      if (process.env.GOOGLE_GENAI_API_KEY) {
        console.log('Listing Google Generative AI models (using REST endpoint)...')
        await listGoogleGenModels()
      } else if (process.env.HUGGINGFACE_API_KEY) {
        console.log('No Google key found, listing Hugging Face models...')
        await listHuggingFaceModels()
      } else {
        console.error('No AI API keys found in .env. Add GOOGLE_GENAI_API_KEY or HUGGINGFACE_API_KEY and try again.')
        process.exit(1)
      }
    })()
