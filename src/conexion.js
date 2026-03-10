import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xdzrnwpxnmjwaasxslrg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkenJud3B4bm1qd2Fhc3hzbHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MjQ1OTgsImV4cCI6MjA4ODUwMDU5OH0.ATJMpJTOdOpvCkW9keOHZQdEb_1qUUnLj1iY4QRCSbY'
const supabasePublishableKey = 'sb_publishable_9ttUHmyCcgam6azjnylZQQ_mvDss2Ba'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabasePublishableKey)