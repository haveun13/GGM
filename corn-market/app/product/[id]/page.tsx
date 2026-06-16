'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, type Product, type Profile, type Comment } from '@/lib/supabase'

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
  const [sellerProductCount, setSellerProductCount] = useState(0)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  // 좋아요
  const [likeCount, setLikeCount] = useState(0)
  const [liked, setLiked] = useState(false)

  // 댓글
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  // 대댓글(답글): 어느 댓글에 답글을 다는 중인지 + 입력 내용
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const router = useRouter()

  // 좋아요 정보 불러오기
  const loadLikes = async (userId: string | null) => {
    const { count } = await supabase
      .from('likes').select('*', { count: 'exact', head: true }).eq('product_id', id)
    setLikeCount(count ?? 0)

    if (userId) {
      const { data } = await supabase
        .from('likes').select('id').eq('product_id', id).eq('user_id', userId).maybeSingle()
      setLiked(!!data)
    } else {
      setLiked(false)
    }
  }

  // 댓글 목록 불러오기 (작성자 닉네임 포함)
  const loadComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('product_id', id)
      .order('created_at', { ascending: true })

    const list = data ?? []

    // 작성자 닉네임을 한 번에 조회해서 붙이기
    const userIds = [...new Set(list.map((c) => c.user_id))]
    let nickMap: Record<string, string> = {}
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles').select('id, nickname').in('id', userIds)
      nickMap = Object.fromEntries((profilesData ?? []).map((p) => [p.id, p.nickname]))
    }

    setComments(list.map((c) => ({ ...c, nickname: nickMap[c.user_id] ?? '알 수 없음' })))
  }

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user.id ?? null
      setCurrentUserId(userId)

      const { data: productData } = await supabase
        .from('products').select('*').eq('id', id).single()

      if (!productData) { router.replace('/market'); return }

      const { data: sellerData } = await supabase
        .from('profiles').select('*').eq('id', productData.seller_id).single()

      // 판매자가 올린 판매글 개수
      const { count: productCount } = await supabase
        .from('products').select('*', { count: 'exact', head: true })
        .eq('seller_id', productData.seller_id)

      setProduct(productData)
      setSeller(sellerData)
      setSellerProductCount(productCount ?? 0)
      await Promise.all([loadLikes(userId), loadComments()])
      setLoading(false)
    }
    init()
  }, [id, router])

  // 좋아요 누르기 / 취소
  const handleToggleLike = async () => {
    if (!currentUserId) { alert('로그인 후 좋아요를 누를 수 있어요.'); return }

    if (liked) {
      // 취소: 화면 먼저 반영 후 삭제
      setLiked(false)
      setLikeCount((n) => Math.max(0, n - 1))
      await supabase.from('likes').delete()
        .eq('product_id', id).eq('user_id', currentUserId)
    } else {
      setLiked(true)
      setLikeCount((n) => n + 1)
      await supabase.from('likes').insert({ product_id: id, user_id: currentUserId })
    }
  }

  // 댓글 작성
  const handleAddComment = async () => {
    if (!currentUserId) { alert('로그인 후 댓글을 작성할 수 있어요.'); return }
    const content = newComment.trim()
    if (!content) return

    setSubmittingComment(true)
    await supabase.from('comments').insert({
      product_id: id, user_id: currentUserId, content, parent_id: null,
    })
    setNewComment('')
    await loadComments()
    setSubmittingComment(false)
  }

  // 답글(대댓글) 작성
  const handleAddReply = async (parentId: string) => {
    if (!currentUserId) { alert('로그인 후 답글을 작성할 수 있어요.'); return }
    const content = replyText.trim()
    if (!content) return

    await supabase.from('comments').insert({
      product_id: id, user_id: currentUserId, content, parent_id: parentId,
    })
    setReplyText('')
    setReplyTo(null)
    await loadComments()
  }

  // 댓글 삭제 (답글이 달린 댓글을 지우면 답글도 함께 삭제됨)
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('댓글을 삭제할까요?')) return
    await supabase.from('comments').delete().eq('id', commentId)
    await loadComments()
  }

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

          {/* 좋아요 + 댓글 개수 */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 font-bold text-sm transition-all active:scale-95 ${
                liked
                  ? 'bg-red-50 border-red-200 text-red-500'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-red-200'
              }`}
            >
              <span className="text-base">{liked ? '❤️' : '🤍'}</span>
              <span>좋아요 {likeCount}</span>
            </button>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border-2 border-gray-200 text-gray-500 font-bold text-sm">
              <span className="text-base">💬</span>
              <span>댓글 {comments.length}</span>
            </div>
          </div>

          {/* 설명 */}
          {product.description && (
            <div className="corn-card p-5">
              <h3 className="text-sm font-black text-gray-700 mb-2">상품 설명</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {/* 판매자 */}
          <div className="corn-card p-4">
            <p className="text-xs text-gray-400 mb-3">판매자</p>
            <div className="flex items-center gap-3">
              {/* 프로필 사진 (없으면 옥수수 기본 이미지) */}
              <div className="w-14 h-14 rounded-full overflow-hidden bg-corn-200 flex items-center justify-center flex-shrink-0">
                {seller?.avatar_url
                  ? <img src={seller.avatar_url} alt={seller.nickname} className="w-full h-full object-cover" />
                  : <span className="text-2xl">🌽</span>}
              </div>
              <div className="flex-1 min-w-0">
                {/* 닉네임 + 판매글 개수 */}
                <div className="flex items-center gap-2">
                  <p className="font-black text-gray-800 truncate">{seller?.nickname ?? '알 수 없음'}</p>
                  <span className="text-xs font-bold text-corn-600 bg-corn-100 px-2 py-0.5 rounded-full flex-shrink-0">
                    판매글 {sellerProductCount}개
                  </span>
                </div>
                {/* 자기소개 */}
                <p className="text-sm text-gray-500 leading-relaxed mt-1 whitespace-pre-wrap break-words">
                  {seller?.bio ? seller.bio : '아직 자기소개가 없어요.'}
                </p>
              </div>
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

          {/* 댓글 */}
          <div className="corn-card p-5">
            <h3 className="text-sm font-black text-gray-700 mb-3">
              댓글 <span className="text-corn-500">{comments.length}</span>
            </h3>

            {/* 댓글 목록 (일반 댓글 → 아래에 답글 들여쓰기) */}
            {comments.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                아직 댓글이 없어요. 첫 댓글을 남겨보세요!
              </p>
            ) : (
              <ul className="space-y-4">
                {comments.filter((c) => !c.parent_id).map((c) => {
                  const replies = comments.filter((r) => r.parent_id === c.id)
                  return (
                    <li key={c.id}>
                      {/* 원댓글 */}
                      <div className="flex gap-2.5">
                        <div className="w-8 h-8 bg-corn-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">🌽</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-gray-700">{c.nickname}</p>
                            <span className="text-[11px] text-gray-400 flex-shrink-0">
                              {new Date(c.created_at).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap break-words">{c.content}</p>
                          {currentUserId && (
                            <button
                              onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); setReplyText('') }}
                              className="text-[11px] text-gray-400 hover:text-corn-500 font-bold mt-1 transition-colors"
                            >
                              {replyTo === c.id ? '취소' : '답글'}
                            </button>
                          )}
                        </div>
                        {currentUserId === c.user_id && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-xs text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 self-start"
                          >
                            삭제
                          </button>
                        )}
                      </div>

                      {/* 답글 목록 (들여쓰기) */}
                      {replies.length > 0 && (
                        <ul className="mt-3 ml-6 pl-4 border-l-2 border-corn-100 space-y-3">
                          {replies.map((r) => (
                            <li key={r.id} className="flex gap-2.5">
                              <div className="w-7 h-7 bg-corn-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs">↪️</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-bold text-gray-700">{r.nickname}</p>
                                  <span className="text-[11px] text-gray-400 flex-shrink-0">
                                    {new Date(r.created_at).toLocaleDateString('ko-KR')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap break-words">{r.content}</p>
                              </div>
                              {currentUserId === r.user_id && (
                                <button
                                  onClick={() => handleDeleteComment(r.id)}
                                  className="text-xs text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 self-start"
                                >
                                  삭제
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* 답글 입력창 */}
                      {replyTo === c.id && currentUserId && (
                        <div className="mt-3 ml-6 pl-4 flex gap-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddReply(c.id) }}
                            placeholder="답글을 입력하세요"
                            maxLength={500}
                            autoFocus
                            className="flex-1 min-w-0 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:border-corn-300 focus:outline-none"
                          />
                          <button
                            onClick={() => handleAddReply(c.id)}
                            disabled={!replyText.trim()}
                            className="px-4 py-2 bg-corn-400 hover:bg-corn-500 text-gray-900 font-black rounded-xl text-sm transition-colors disabled:opacity-50 flex-shrink-0"
                          >
                            등록
                          </button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}

            {/* 댓글 입력 */}
            {currentUserId ? (
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment() }}
                  placeholder="댓글을 입력하세요"
                  maxLength={500}
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-2xl border-2 border-gray-200 text-sm focus:border-corn-300 focus:outline-none"
                />
                <button
                  onClick={handleAddComment}
                  disabled={submittingComment || !newComment.trim()}
                  className="px-5 py-2.5 bg-corn-400 hover:bg-corn-500 text-gray-900 font-black rounded-2xl text-sm transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  등록
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-400 text-center">
                <Link href="/login" className="text-corn-500 font-bold underline">로그인</Link> 후 댓글을 작성할 수 있어요.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
