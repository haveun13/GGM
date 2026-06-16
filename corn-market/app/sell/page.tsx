'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ImageUpload } from '@/components/ImageUpload'

const CATEGORIES = ['디지털/가전', '의류/패션', '가구/인테리어', '도서/음반', '스포츠/레저', '유아동', '뷰티/미용', '반려동물', '기타']
const CONDITIONS = ['새상품 (미개봉)', '거의 새것', '중고']

export default function SellPage() {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/login')
    })
  }, [router])

  const handleImageChange = (file: File) => {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleImageRemove = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const uploadImage = async (userId: string): Promise<string | null> => {
    if (!imageFile) return null
    const ext = imageFile.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, imageFile)
    if (error) throw error
    return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!category) { setError('카테고리를 선택해 주세요.'); return }
    if (!condition) { setError('상품 상태를 선택해 주세요.'); return }

    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.replace('/login'); return }

    let imageUrl: string | null = null
    try {
      imageUrl = await uploadImage(session.user.id)
    } catch {
      setError('이미지 업로드 중 오류가 발생했어요.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('products').insert({
      seller_id: session.user.id,
      title: title.trim(),
      price: Number(price),
      category,
      condition,
      description: description.trim(),
      image_url: imageUrl,
    })

    if (error) {
      setError('글 등록 중 오류가 발생했어요.')
      setLoading(false)
    } else {
      router.push('/market')
    }
  }

  return (
    <div className="min-h-screen bg-corn-50">
      <header className="bg-white border-b-2 border-corn-300 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/market" className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors">
            <span className="text-lg">←</span>
            <span className="text-sm font-bold">뒤로</span>
          </Link>
          <h1 className="text-base font-black text-gray-800">판매글 작성</h1>
          <button
            form="sell-form"
            type="submit"
            disabled={loading}
            className="text-sm px-4 py-1.5 bg-corn-400 hover:bg-corn-500 text-gray-900 font-black rounded-full transition-colors disabled:opacity-50"
          >
            {loading ? '등록 중...' : '등록'}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-20">
        <form id="sell-form" onSubmit={handleSubmit} className="space-y-4">

          {/* 사진 */}
          <div className="corn-card p-5">
            <label className="block text-sm font-black text-gray-700 mb-3">사진</label>
            <ImageUpload preview={imagePreview} onChange={handleImageChange} onRemove={handleImageRemove} />
          </div>

          {/* 제목 */}
          <div className="corn-card p-5">
            <label className="block text-sm font-black text-gray-700 mb-2">
              제목 <span className="text-corn-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="상품명을 입력하세요"
              required
              maxLength={50}
              className="corn-input"
            />
            <p className="text-right text-xs text-gray-400 mt-1">{title.length}/50</p>
          </div>

          {/* 가격 */}
          <div className="corn-card p-5">
            <label className="block text-sm font-black text-gray-700 mb-2">
              가격 <span className="text-corn-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                required
                min={0}
                className="corn-input pr-10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold">원</span>
            </div>
          </div>

          {/* 카테고리 */}
          <div className="corn-card p-5">
            <label className="block text-sm font-black text-gray-700 mb-2">
              카테고리 <span className="text-corn-400">*</span>
            </label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="corn-input">
              <option value="">카테고리 선택</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* 상품 상태 */}
          <div className="corn-card p-5">
            <label className="block text-sm font-black text-gray-700 mb-3">
              상품 상태 <span className="text-corn-400">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {CONDITIONS.map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setCondition(cond)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                    condition === cond
                      ? 'bg-corn-400 border-corn-400 text-gray-900'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-corn-300'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* 설명 */}
          <div className="corn-card p-5">
            <label className="block text-sm font-black text-gray-700 mb-2">상품 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="브랜드, 사이즈, 구매 시기, 상태 등을 자세히 적어주세요."
              rows={6}
              maxLength={1000}
              className="corn-input resize-none"
            />
            <p className="text-right text-xs text-gray-400 mt-1">{description.length}/1000</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}
        </form>
      </main>
    </div>
  )
}
