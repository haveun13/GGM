import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  nickname: string
  avatar_url: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  seller_id: string
  title: string
  description: string
  price: number
  category: string
  condition: string
  status: string
  image_url: string | null
  created_at: string
}
