'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, type Profile, type Product } from '@/lib/supabase'
import { Header } from '@/components/Header'
import { ProductCard } from '@/components/ProductCard'
import { CornCharacter } from '@/components/CornCharacter'

// 좋아요 수를 함께 들고 다니기 위한 타입
type ProductWithLikes = Product & { likeCount: number }

export default function MarketPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [popular, setPopular] = useState<ProductWithLikes[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }

      const [{ data: profileData }, { data: productsData }, { data: likesData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('products').select('*').neq('status', '거래완료').order('created_at', { ascending: false }),
        supabase.from('likes').select('product_id'),
      ])

      const list = productsData ?? []

      // 상품별 좋아요 수 세기
      const likeCountMap: Record<string, number> = {}
      for (const { product_id } of likesData ?? []) {
        likeCountMap[product_id] = (likeCountMap[product_id] ?? 0) + 1
      }

      // 인기 상품: 좋아요 1개 이상인 상품을 많은 순으로 TOP 5
      const popularList = list
        .map((p) => ({ ...p, likeCount: likeCountMap[p.id] ?? 0 }))
        .filter((p) => p.likeCount > 0)
        .sort((a, b) => b.likeCount - a.likeCount)
        .slice(0, 5)

      setProfile(profileData)
      setProducts(list)
      setPopular(popularList)
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

      {/* 히어로 비주얼 배너 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-corn-300 via-corn-400 to-corn-500">
        {/* 배경 장식 옥수수들 (둥실둥실 떠다님) */}
        <span className="absolute -top-4 -left-3 text-7xl opacity-20 rotate-12 select-none animate-float-1">🌽</span>
        <span className="absolute top-10 right-6 text-5xl opacity-25 -rotate-12 select-none animate-float-2">🌽</span>
        <span className="absolute -bottom-5 right-1/3 text-6xl opacity-20 rotate-6 select-none animate-float-3">🌽</span>

        <div className="relative max-w-2xl mx-auto px-5 py-9 flex items-center justify-between gap-4">
          <div>
            <span className="inline-block text-xs font-black text-corn-600 bg-white/70 px-3 py-1 rounded-full mb-3">
              🌽 우리 동네 옥수수밭
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              이웃과 알알이 나누는<br />귀여운 중고거래, 옥수수마켓
            </h1>
            <p className="text-sm text-gray-800/80 mt-2 font-medium">
              안 쓰는 물건은 팔고, 필요한 물건은 합리적으로 🌽
            </p>
            <Link
              href="/sell"
              className="inline-flex items-center gap-1.5 mt-5 px-6 py-2.5 bg-gray-900 text-white font-black rounded-2xl text-sm hover:bg-gray-800 transition-colors active:scale-95"
            >
              📦 지금 판매하기
            </Link>
          </div>
          {/* 귀여운 옥수수 캐릭터 (통통 튀며 살랑살랑 춤춤) */}
          <div className="flex-shrink-0 hidden sm:block animate-corn-dance drop-shadow-lg origin-bottom">
            <CornCharacter size={130} />
          </div>
        </div>
      </section>

      <main className="max-w-2xl mx-auto px-4 py-5">
        {/* 지금 인기 상품 (좋아요 많은 순) */}
        {popular.length > 0 && (
          <section className="mb-6">
            <h3 className="text-base font-black text-gray-800 flex items-center gap-1.5 mb-3">
              <span>🔥</span> 지금 인기 상품
              <span className="text-xs font-bold text-gray-400">좋아요 많은 순</span>
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
              {popular.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="corn-card p-0 overflow-hidden flex-shrink-0 w-36 snap-start hover:shadow-md transition-shadow"
                >
                  <div className="relative w-36 h-36 bg-corn-100 flex items-center justify-center">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                      : <span className="text-4xl">🌽</span>}
                    {/* 순위 배지 */}
                    <span className="absolute top-2 left-2 w-6 h-6 bg-gray-900 text-white text-xs font-black rounded-full flex items-center justify-center">
                      {i + 1}
                    </span>
                    {/* 좋아요 수 */}
                    <span className="absolute bottom-2 right-2 text-xs font-bold text-red-500 bg-white/90 px-2 py-0.5 rounded-full">
                      ❤️ {p.likeCount}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-bold text-gray-800 line-clamp-1">{p.title}</p>
                    <p className="text-sm font-black text-gray-900 mt-1">{p.price.toLocaleString()}원</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

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
            products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>

        {/* 옥수수마켓 소개 (맨 아래) */}
        <section className="corn-card p-5 mt-6">
          <h3 className="text-base font-black text-gray-800 flex items-center gap-1.5">
            <span>🌽</span> 옥수수마켓이 뭐예요?
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed mt-2">
            옥수수마켓은 <span className="font-bold text-corn-600">우리 동네 이웃끼리</span> 안 쓰는 물건을
            사고파는 따뜻한 중고거래 공간이에요. 마음에 드는 물건에 <span className="font-bold text-red-400">좋아요 ❤️</span>를
            누르고, <span className="font-bold text-corn-600">댓글 💬</span>로 편하게 물어보세요!
          </p>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { icon: '🤝', label: '이웃 직거래' },
              { icon: '💰', label: '합리적 가격' },
              { icon: '😊', label: '간편한 등록' },
            ].map((f) => (
              <div key={f.label} className="bg-corn-50 rounded-2xl py-3 flex flex-col items-center gap-1">
                <span className="text-xl">{f.icon}</span>
                <span className="text-xs font-bold text-gray-600">{f.label}</span>
              </div>
            ))}
          </div>
        </section>
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
