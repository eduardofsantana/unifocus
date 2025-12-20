import { createClient } from '@supabase/supabase-js'

// Mantenha a URL que já estava certa
const supabaseUrl = 'https://llbmdcosvsuguadwgski.supabase.co' 

// COLE AQUI A CHAVE "ANON / PUBLIC" (A que não é secreta)
const supabaseKey = 'sb_publishable_bpGYnxI7izPpPtOAigcVpw_aCSuxFvD' 

export const supabase = createClient(supabaseUrl, supabaseKey)