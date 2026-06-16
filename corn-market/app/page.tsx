'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      router.replace(session ? '/market' : '/login')
    })
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center animate-pulse">
        <div className="text-6xl mb-3">🌽</div>
        <p className="text-corn-500 font-bold">옥수수마켓</p>
      </div>
    </div>
  )
}
