'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, type Product } from '@/lib/supabase'
import { ImageUpload } from '@/components/ImageUpload'

const CATEGORIES = ['디지털/가전', '의류/패션', '가구/인테리어', '도서/음반', '스포츠/레저', '유아동', '뷰티/미용', '반려동물', '기타']
const CONDITIONS = ['새상품 (미개봉)', '거의 새것', '중고']

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }

      const { data } = await supabase
        .from('products').select('*').eq('id', params.id).single()

      if (!data || data.seller_id !== session.user.id) { router.replace('/market'); return }

      setProduct(data)
      setTitle(data.title)
      setPrice(String(data.price))
      setCategory(data.category)
      setCondition(data.condition)
      setDescription(data.description ?? '')
      setImagePreview(data.image_url)
      setLoading(false)
    }
    init()
  }, [params.id, router])

  const handleImageChange = (file: File) => {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setRemoveImage(false)
  }

  const handleImageRemove = () => {
    setImageFile(null)
    setImagePreview(null)
    setRemoveImage(true)
  }

  const deleteOldImage = async () => {
    if (!product?.image_url) return
    const path = product.image_url.split('/storage/v1/object/public/product-images/')[1]
    if (path) await supabase.storage.from('product-images').remove([path])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return
    setError('')
    if (!category) { setError('카테고리를 선택해 주세요.'); return }
    if (!condition) { setError('상품 상태를 선택해 주세요.'); return }

    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.replace('/login'); return }

    let imageUrl: string | null = product.image_url

    if (removeImage) {
      await deleteOldImage()
      imageUrl = null
    } else if (imageFile) {
      await deleteOldImage()
      const ext = imageFile.name.split('.').pop()
      const path = `${session.user.id}/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('product-images').upload(path, imageFile)
      if (uploadErr) { setError('이미지 업로드 중 오류가 발생했어요.'); setSaving(false); return }
      imageUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
    }

    const { error } = await supabase.from('products').update({
      title: title.trim(),
      price: Number(price),
      category,
      condition,
      description: description.trim(),
      image_url: imageUrl,
    }).eq('id', product.id)

    if (error) {
      setError('수정 중 오류가 발생했어요.')
      setSaving(false)
    } else {
      router.push(`/product/${product.id}`)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center animate-pulse">
        <div className="text-5xl mb-3">🌽</div>
        <p className="text-corn-500 font-bold">불러오는 중...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-corn-50">
      <header className="bg-white border-b-2 border-corn-300 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/product/${params.id}`} className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors">
            <span className="text-lg">←</span>
            <span className="text-sm font-bold">뒤로</span>
          </Link>
          <h1 className="text-base font-black text-gray-800">판매글 수정</h1>
          <button
            form="edit-form"
            type="submit"
            disabled={saving}
            className="text-sm px-4 py-1.5 bg-corn-400 hover:bg-corn-500 text-gray-900 font-black rounded-full transition-colors disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-20">
        <form id="edit-form" onSubmit={handleSubmit} className="space-y-4">

          <div className="corn-card p-5">
            <label className="block text-sm font-black text-gray-700 mb-3">사진</label>
            <ImageUpload preview={imagePreview} onChange={handleImageChange} onRemove={handleImageRemove} />
          </div>

          <div className="corn-card p-5">
            <label className="block text-sm font-black text-gray-700 mb-2">
              제목 <span className="text-corn-400">*</span>
            </label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="상품명을 입력하세요" required maxLength={50} className="corn-input"
            />
            <p className="text-right text-xs text-gray-400 mt-1">{title.length}/50</p>
          </div>

          <div className="corn-card p-5">
            <label className="block text-sm font-black text-gray-700 mb-2">
              가격 <span className="text-corn-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder="0" required min={0} className="corn-input pr-10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold">원</span>
            </div>
          </div>

          <div className="corn-card p-5">
            <label className="block text-sm font-black text-gray-700 mb-2">
              카테고리 <span className="text-corn-400">*</span>
            </label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="corn-input">
              <option value="">카테고리 선택</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="corn-card p-5">
            <label className="block text-sm font-black text-gray-700 mb-3">
              상품 상태 <span className="text-corn-400">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {CONDITIONS.map((cond) => (
                <button
                  key={cond} type="button" onClick={() => setCondition(cond)}
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

          <div className="corn-card p-5">
            <label className="block text-sm font-black text-gray-700 mb-2">상품 설명</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="브랜드, 사이즈, 구매 시기, 상태 등을 자세히 적어주세요."
              rows={6} maxLength={1000} className="corn-input resize-none"
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
