'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { CornCharacter } from '@/components/CornCharacter'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않아요 😢')
      setLoading(false)
    } else {
      router.push('/market')
    }
  }

  return (
    <div className="min-h-screen bg-corn-50 flex flex-col items-center justify-center p-4">
      {/* 로고 영역 */}
      <div className="flex flex-col items-center mb-8">
        <CornCharacter size={110} />
        <h1 className="text-3xl font-black text-corn-500 mt-1 tracking-tight">
          옥수수마켓
        </h1>
        <p className="text-gray-400 text-sm mt-1">🌽 우리 동네 귀여운 중고거래</p>
      </div>

      {/* 로그인 카드 */}
      <div className="w-full max-w-sm corn-card p-7">
        <h2 className="text-xl font-black text-gray-800 mb-6 text-center">로그인</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="corn-input"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="corn-input"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="corn-btn-primary mt-2">
            {loading ? '로그인 중...' : '🌽 로그인'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400">
            아직 회원이 아니신가요?{' '}
            <Link href="/signup" className="text-corn-500 font-black hover:text-corn-600 transition-colors">
              회원가입
            </Link>
          </p>
        </div>
      </div>

      {/* 하단 장식 */}
      <p className="mt-8 text-xs text-gray-300">🌽🌽🌽 옥수수마켓 🌽🌽🌽</p>
    </div>
  )
}
