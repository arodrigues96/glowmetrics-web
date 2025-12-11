// supabase.js - Cliente Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_9mxekBWP1yv3OVr5b-ZvoQ_NP-6AFwj'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

