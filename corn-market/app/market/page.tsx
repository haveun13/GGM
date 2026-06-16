'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Profile } from '@/lib/supabase'
import { Header } from '@/components/Header'
import { CornCharacter } from '@/components/CornCharacter'

export default function MarketPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center animate-pulse">
          <div className="text-5xl mb-3">🌽</div>
          <p className="text-corn-500 font-bold">불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-corn-50">
      <Header nickname={profile?.nickname} />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* 환영 배너 */}
        <div className="corn-card p-6 mb-6 flex items-center gap-4">
          <CornCharacter size={72} />
          <div>
            <p className="text-gray-400 text-sm">안녕하세요!</p>
            <h2 className="text-xl font-black text-gray-800">
              {profile?.nickname ?? '옥수수유저'} 님 👋
            </h2>
            <p className="text-sm text-corn-500 font-bold mt-1">
              옥수수마켓에 오신 걸 환영해요 🌽
            </p>
          </div>
        </div>

        {/* 빠른 메뉴 */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { icon: '📦', label: '판매하기' },
            { icon: '🔍', label: '검색' },
            { icon: '❤️', label: '관심목록' },
            { icon: '💬', label: '채팅' },
          ].map((item) => (
            <button
              key={item.label}
              className="corn-card p-3 flex flex-col items-center gap-1.5 hover:border-corn-400 transition-colors"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-bold text-gray-600">{item.label}</span>
            </button>
          ))}
        </div>

        {/* 상품 목록 (준비 중) */}
        <div className="corn-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-800 text-base">내 근처 매물</h3>
            <span className="text-xs text-corn-500 font-bold bg-corn-100 px-2 py-1 rounded-full">
              Coming Soon
            </span>
          </div>

          <div className="flex flex-col items-center py-10 text-center">
            <div className="text-5xl mb-3">🌽</div>
            <p className="text-gray-500 font-bold">아직 등록된 상품이 없어요</p>
            <p className="text-sm text-gray-400 mt-1">
              곧 상품 등록 기능이 추가될 예정이에요!
            </p>
            <button className="corn-btn-primary mt-5 w-auto px-8">
              + 첫 상품 등록하기
            </button>
          </div>
        </div>

        {/* 내 정보 카드 */}
        <div className="corn-card p-5 mt-4">
          <h3 className="font-black text-gray-800 text-sm mb-3">내 정보</h3>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>닉네임</span>
              <span className="font-bold text-gray-700">{profile?.nickname}</span>
            </div>
            <div className="flex justify-between">
              <span>가입일</span>
              <span className="font-bold text-gray-700">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('ko-KR')
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>판매 중인 상품</span>
              <span className="font-bold text-corn-500">0개</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
