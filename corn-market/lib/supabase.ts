import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  nickname: string
  avatar_url: string | null
  bio: string | null
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

export type Comment = {
  id: string
  product_id: string
  user_id: string
  content: string
  created_at: string
  // null이면 일반 댓글, 값이 있으면 그 댓글에 대한 대댓글(답글)
  parent_id: string | null
  // 작성자 닉네임 (profiles 조인 결과)
  nickname?: string
}
