import Link from 'next/link'
import type { Product } from '@/lib/supabase'

const STATUS_BADGE: Record<string, string> = {
  '판매중':   'bg-green-100 text-green-600',
  '예약중':   'bg-yellow-100 text-yellow-600',
  '거래완료': 'bg-gray-100 text-gray-400',
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="flex gap-3 py-4 hover:bg-corn-50 rounded-xl -mx-1 px-1 transition-colors"
    >
      {/* 썸네일 */}
      <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-corn-100 flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl">🌽</span>
        )}
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2">{product.title}</h4>
          {product.status !== '판매중' && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_BADGE[product.status] ?? 'bg-gray-100 text-gray-400'}`}>
              {product.status}
            </span>
          )}
        </div>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{product.category}</span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{product.condition}</span>
        </div>
        <p className="font-black text-gray-900 mt-2 text-sm">{product.price.toLocaleString()}원</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(product.created_at).toLocaleDateString('ko-KR')}
        </p>
      </div>
    </Link>
  )
}
