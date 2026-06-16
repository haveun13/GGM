'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { CornCharacter } from '@/components/CornCharacter'

export default function SignupPage() {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않아요 😢')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요!')
      return
    }
    if (nickname.trim().length < 2) {
      setError('닉네임은 2자 이상이어야 해요!')
      return
    }

    setLoading(true)

    // signUp 시 options.data.nickname을 넘기면 트리거가 profiles에 자동 삽입
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname: nickname.trim() },
      },
    })

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        setError('이미 가입된 이메일이에요 😢')
      } else if (error.message.includes('rate limit')) {
        setError('잠시 후 다시 시도해 주세요!')
      } else {
        setError('회원가입 중 오류가 발생했어요. 다시 시도해 주세요.')
      }
      setLoading(false)
      return
    }

    router.push('/market')
  }

  return (
    <div className="min-h-screen bg-corn-50 flex flex-col items-center justify-center p-4">
      {/* 로고 영역 */}
      <div className="flex flex-col items-center mb-6">
        <CornCharacter size={90} />
        <h1 className="text-2xl font-black text-corn-500 mt-1 tracking-tight">
          옥수수마켓
        </h1>
      </div>

      {/* 회원가입 카드 */}
      <div className="w-full max-w-sm corn-card p-7">
        <h2 className="text-xl font-black text-gray-800 mb-6 text-center">회원가입</h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">
              닉네임 <span className="text-corn-400">*</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="옥수수왕자 (2자 이상)"
              required
              maxLength={20}
              className="corn-input"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">
              이메일 <span className="text-corn-400">*</span>
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
              비밀번호 <span className="text-corn-400">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
              required
              className="corn-input"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">
              비밀번호 확인 <span className="text-corn-400">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 다시 입력"
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
            {loading ? '가입 중...' : '🌽 가입하기'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400">
            이미 회원이신가요?{' '}
            <Link href="/login" className="text-corn-500 font-black hover:text-corn-600 transition-colors">
              로그인
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-300">🌽🌽🌽 옥수수마켓 🌽🌽🌽</p>
    </div>
  )
}
