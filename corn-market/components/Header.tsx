'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface HeaderProps {
  nickname?: string
}

export function Header({ nickname }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="bg-white border-b-2 border-corn-300 sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/market" className="flex items-center gap-2">
          <span className="text-2xl">🌽</span>
          <span className="text-lg font-black text-corn-500">옥수수마켓</span>
        </Link>

        <div className="flex items-center gap-3">
          {nickname && (
            <span className="text-sm text-gray-500 hidden sm:block">
              <span className="font-bold text-corn-500">{nickname}</span> 님
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-1.5 rounded-full border-2 border-corn-400 text-corn-600 font-bold hover:bg-corn-50 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  )
}
