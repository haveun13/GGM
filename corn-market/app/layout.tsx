import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '옥수수마켓 🌽',
  description: '우리 동네 귀여운 중고거래 마켓',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
