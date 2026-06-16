'use client'

import { useRef } from 'react'

interface ImageUploadProps {
  preview: string | null
  onChange: (file: File) => void
  onRemove: () => void
}

export function ImageUpload({ preview, onChange, onRemove }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 해요.')
      return
    }
    onChange(file)
    e.target.value = ''
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="상품 이미지"
            className="w-full h-64 object-cover rounded-2xl"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
          >
            ✕
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full shadow transition-colors"
          >
            사진 변경
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-48 border-2 border-dashed border-corn-300 hover:border-corn-400 bg-corn-50 hover:bg-corn-100 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
        >
          <span className="text-4xl">📷</span>
          <span className="text-sm font-bold text-gray-500">사진 추가하기</span>
          <span className="text-xs text-gray-400">JPG, PNG, WEBP (최대 5MB)</span>
        </button>
      )}
    </div>
  )
}
