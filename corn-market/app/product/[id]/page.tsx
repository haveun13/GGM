'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, type Product, type Profile } from '@/lib/supabase'

const STATUS_OPTIONS = ['판매중', '예약중', '거래완료']
const STATUS_COLORS: Record<string, string> = {
  '판매중':   'bg-green-100 text-green-700',
  '예약중':   'bg-yellow-100 text-yellow-700',
  '거래완료': 'bg-gray-100 text-gray-500',
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [seller, setSeller] = useState<Profile | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setCurrentUserId(session?.user.id ?? null)

      const { data: productData } = await supabase
        .from('products').select('*').eq('id', id).single()

      if (!productData) { router.replace('/market'); return }

      const { data: sellerData } = await supabase
        .from('profiles').select('*').eq('id', productData.seller_id).single()

      setProduct(productData)
      setSeller(sellerData)
      setLoading(false)
    }
    init()
  }, [id, router])

  const handleStatusChange = async (newStatus: string) => {
    if (!product) return
    const { data } = await supabase
      .from('products').update({ status: newStatus })
      .eq('id', product.id).select().single()
    if (data) setProduct(data)
  }

  const handleDelete = async () => {
    if (!product || !window.confirm('정말 이 판매글을 삭제할까요?')) return
    setDeleting(true)

    if (product.image_url) {
      const path = product.image_url.split('/storage/v1/object/public/product-images/')[1]
      if (path) await supabase.storage.from('product-images').remove([path])
    }

    await supabase.from('products').delete().eq('id', product.id)
    router.push('/market')
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center animate-pulse">
        <div className="text-5xl mb-3">🌽</div>
        <p className="text-corn-500 font-bold">불러오는 중...</p>
      </div>
    </div>
  )

  if (!product) return null

  const isMine = currentUserId === product.seller_id

  return (
    <div className="min-h-screen bg-corn-50">
      <header className="bg-white border-b-2 border-corn-300 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/market" className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors">
            <span className="text-lg">←</span>
            <span className="text-sm font-bold">목록</span>
          </Link>
          <span className="text-base font-black text-gray-800">상품 상세</span>
          {isMine
            ? <Link href={`/product/${id}/edit`} className="text-sm text-corn-500 font-black hover:text-corn-600 transition-colors">수정</Link>
            : <div className="w-10" />
          }
        </div>
      </header>

      <main className="max-w-2xl mx-auto pb-10">
        {/* 이미지 */}
        {product.image_url ? (
          <img src={product.image_url} alt={product.title} className="w-full aspect-square object-cover" />
        ) : (
          <div className="w-full aspect-square bg-corn-100 flex items-center justify-center">
            <span className="text-8xl">🌽</span>
          </div>
        )}

        <div className="px-4 py-5 space-y-4">
          {/* 제목 + 상태 */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-black text-gray-900 leading-snug">{product.title}</h1>
              <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[product.status] ?? 'bg-gray-100 text-gray-500'}`}>
                {product.status}
              </span>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap items-center">
              <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{product.category}</span>
              <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{product.condition}</span>
              <span className="text-xs text-gray-400">{new Date(product.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
          </div>

          {/* 가격 */}
          <div className="corn-card p-4">
            <p className="text-2xl font-black text-gray-900">
              {product.price.toLocaleString()}
              <span className="text-base font-bold text-gray-400 ml-1">원</span>
            </p>
          </div>

          {/* 설명 */}
          {product.description && (
            <div className="corn-card p-5">
              <h3 className="text-sm font-black text-gray-700 mb-2">상품 설명</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {/* 판매자 */}
          <div className="corn-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-corn-200 rounded-full flex items-center justify-center">
              <span className="text-lg">🌽</span>
            </div>
            <div>
              <p className="text-xs text-gray-400">판매자</p>
              <p className="font-bold text-gray-800">{seller?.nickname ?? '알 수 없음'}</p>
            </div>
          </div>

          {/* 내 상품 관리 */}
          {isMine && (
            <div className="space-y-3">
              <div className="corn-card p-4">
                <p className="text-sm font-black text-gray-700 mb-3">거래 상태 변경</p>
                <div className="flex gap-2 flex-wrap">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                        product.status === s
                          ? 'bg-corn-400 border-corn-400 text-gray-900'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-corn-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full py-3 rounded-2xl border-2 border-red-200 text-red-400 hover:bg-red-50 hover:border-red-300 font-bold text-sm transition-colors disabled:opacity-50"
              >
                {deleting ? '삭제 중...' : '🗑 판매글 삭제'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
