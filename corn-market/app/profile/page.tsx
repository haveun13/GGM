'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, type Profile } from '@/lib/supabase'

export default function ProfileEditPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null) // 저장된 사진
  const [avatarFile, setAvatarFile] = useState<File | null>(null)  // 새로 고른 사진
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null) // 미리보기

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }

      const { data } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single<Profile>()

      setUserId(session.user.id)
      setNickname(data?.nickname ?? '')
      setBio(data?.bio ?? '')
      setAvatarUrl(data?.avatar_url ?? null)
      setLoading(false)
    }
    init()
  }, [router])

  // 사진 고르기
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('파일 크기는 5MB 이하여야 해요.'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  // 사진 제거 (기본 옥수수로)
  const handleRemovePhoto = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    setAvatarUrl(null)
  }

  // 새 사진 업로드 → 공개 URL 반환
  const uploadAvatar = async (uid: string): Promise<string | null> => {
    if (!avatarFile) return avatarUrl // 새로 고른 게 없으면 기존 값 유지
    const ext = avatarFile.name.split('.').pop()
    const path = `avatars/${uid}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, avatarFile)
    if (error) throw error
    return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!userId) return
    if (nickname.trim().length < 2) { setError('닉네임은 2자 이상이어야 해요!'); return }

    setSaving(true)
    let newAvatarUrl: string | null = avatarUrl
    try {
      newAvatarUrl = await uploadAvatar(userId)
    } catch {
      setError('사진 업로드 중 오류가 발생했어요.')
      setSaving(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        nickname: nickname.trim(),
        bio: bio.trim() || null,
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      if (updateError.code === '23505') {
        setError('이미 사용 중인 닉네임이에요 😢')
      } else {
        setError('저장 중 오류가 발생했어요. 다시 시도해 주세요.')
      }
      setSaving(false)
      return
    }

    setDone(true)
    setSaving(false)
    setTimeout(() => router.push('/market'), 800)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center animate-pulse">
        <div className="text-5xl mb-3">🌽</div>
        <p className="text-corn-500 font-bold">불러오는 중...</p>
      </div>
    </div>
  )

  // 화면에 보여줄 사진: 새 미리보기 > 저장된 사진 > 없음
  const shownPhoto = avatarPreview ?? avatarUrl

  return (
    <div className="min-h-screen bg-corn-50">
      <header className="bg-white border-b-2 border-corn-300 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/market" className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors">
            <span className="text-lg">←</span>
            <span className="text-sm font-bold">뒤로</span>
          </Link>
          <h1 className="text-base font-black text-gray-800">내 프로필 편집</h1>
          <button
            form="profile-form"
            type="submit"
            disabled={saving}
            className="text-sm px-4 py-1.5 bg-corn-400 hover:bg-corn-500 text-gray-900 font-black rounded-full transition-colors disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-20">
        <form id="profile-form" onSubmit={handleSave} className="space-y-4">

          {/* 프로필 사진 */}
          <div className="corn-card p-5 flex flex-col items-center">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-28 h-28 rounded-full overflow-hidden bg-corn-200 flex items-center justify-center">
              {shownPhoto
                ? <img src={shownPhoto} alt="프로필 사진" className="w-full h-full object-cover" />
                : <span className="text-5xl">🌽</span>}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-4 py-2 rounded-full text-sm font-bold border-2 border-corn-300 text-corn-600 hover:bg-corn-50 transition-colors"
              >
                📷 사진 {shownPhoto ? '변경' : '추가'}
              </button>
              {shownPhoto && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-4 py-2 rounded-full text-sm font-bold border-2 border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  제거
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">JPG, PNG, WEBP (최대 5MB)</p>
          </div>

          {/* 닉네임 */}
          <div className="corn-card p-5">
            <label className="block text-sm font-black text-gray-700 mb-2">
              닉네임 <span className="text-corn-400">*</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임 (2자 이상)"
              required
              maxLength={20}
              className="corn-input"
            />
            <p className="text-right text-xs text-gray-400 mt-1">{nickname.length}/20</p>
          </div>

          {/* 자기소개 */}
          <div className="corn-card p-5">
            <label className="block text-sm font-black text-gray-700 mb-2">자기소개</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="이웃에게 나를 소개해 보세요! (예: 주로 어떤 물건을 파는지, 거래 방식 등)"
              rows={4}
              maxLength={200}
              className="corn-input resize-none"
            />
            <p className="text-right text-xs text-gray-400 mt-1">{bio.length}/200</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}
          {done && (
            <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
              <p className="text-green-600 text-sm text-center font-bold">저장되었어요! 🌽</p>
            </div>
          )}
        </form>
      </main>
    </div>
  )
}
