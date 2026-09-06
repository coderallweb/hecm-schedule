import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://upyolshzhwfarvnyqjsq.supabase.co/"
const supabaseAnonKey = "sb_publishable_CnvJ9JWKlPz2irpzOqzB6w_Gm2SXVqZ"

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)
