import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gtlddcktfahpurodhimv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bGRkY2t0ZmFocHVyb2RoaW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1OTkwMDAsImV4cCI6MjA2OTE3NTAwMH0.ePyydXrISKpckpAuk7EovMcKFcxViEuJWw-y0rnsfbo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
