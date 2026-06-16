'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, type Profile, type Product } from '@/lib/supabase'
import { Header } from '@/components/Header'
import { ProductCard } from '@/components/ProductCard'

export default function MarketPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }

      const [{ data: profileData }, { data: productsData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('products').select('*').neq('status', '거래완료').order('created_at', { ascending: false }),
      ])

      setProfile(profileData)
      setProducts(productsData ?? [])
      setLoading(false)
    }
    init()
  }, [router])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center animate-pulse">
        <div className="text-5xl mb-3">🌽</div>
        <p className="text-corn-500 font-bold">불러오는 중...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-corn-50 pb-28">
      <Header nickname={profile?.nickname} />

      <main className="max-w-2xl mx-auto px-4 py-5">
        {/* 인사말 */}
        <div className="mb-5">
          <h2 className="text-lg font-black text-gray-800">
            {profile?.nickname ?? '이웃'} 님 안녕하세요 👋
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">내 근처 판매 중인 상품이에요</p>
        </div>

        {/* 상품 목록 */}
        <div className="corn-card px-4 divide-y divide-gray-100">
          {products.length === 0 ? (
            <div className="flex flex-col items-center py-14 text-center">
              <span className="text-5xl mb-3">🌽</span>
              <p className="text-gray-500 font-bold">아직 등록된 상품이 없어요</p>
              <p className="text-sm text-gray-400 mt-1">첫 번째로 상품을 올려보세요!</p>
              <Link
                href="/sell"
                className="mt-5 px-8 py-2.5 bg-corn-400 hover:bg-corn-500 text-gray-900 font-black rounded-2xl text-sm transition-colors"
              >
                + 판매글 쓰기
              </Link>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </main>

      {/* 플로팅 판매하기 버튼 */}
      <Link
        href="/sell"
        className="fixed bottom-6 right-4 bg-corn-400 hover:bg-corn-500 text-gray-900 font-black px-5 py-3.5 rounded-full shadow-lg flex items-center gap-2 transition-all active:scale-95"
      >
        <span className="text-base">📦</span>
        <span className="text-sm">판매하기</span>
      </Link>
    </div>
  )
}
