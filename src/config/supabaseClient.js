// src/config/supabaseClient.js
const { createClient } = require('@supabase/supabase-js')

// You should store these in environment variables, not hard-code them
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY // For a Node.js app, you'd use your 'service_role' key

const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = supabase
