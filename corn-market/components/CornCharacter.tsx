export function CornCharacter({ size = 120 }: { size?: number }) {
  const h = Math.round(size * 1.33)
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 120 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 옥수수 수염 (실크) */}
      <path d="M53 46 C50 33 47 20 44 8" stroke="#C8960C" strokeWidth="2" strokeLinecap="round"/>
      <path d="M57 45 C55 32 52 19 50 7" stroke="#D4A017" strokeWidth="2" strokeLinecap="round"/>
      <path d="M60 44 C60 31 60 18 60 5" stroke="#D4A017" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M63 45 C65 32 68 19 70 7" stroke="#D4A017" strokeWidth="2" strokeLinecap="round"/>
      <path d="M67 46 C70 33 73 20 76 8" stroke="#C8960C" strokeWidth="2" strokeLinecap="round"/>

      {/* 옥수수 몸통 */}
      <ellipse cx="60" cy="107" rx="30" ry="53" fill="#FFD700"/>

      {/* 알갱이 패턴 */}
      <ellipse cx="51" cy="82" rx="4.5" ry="5.5" fill="#E6A800" opacity="0.35"/>
      <ellipse cx="60" cy="80" rx="4.5" ry="5.5" fill="#E6A800" opacity="0.35"/>
      <ellipse cx="69" cy="82" rx="4.5" ry="5.5" fill="#E6A800" opacity="0.35"/>
      <ellipse cx="47" cy="94" rx="4.5" ry="5.5" fill="#E6A800" opacity="0.28"/>
      <ellipse cx="56" cy="92" rx="4.5" ry="5.5" fill="#E6A800" opacity="0.28"/>
      <ellipse cx="65" cy="92" rx="4.5" ry="5.5" fill="#E6A800" opacity="0.28"/>
      <ellipse cx="74" cy="94" rx="4.5" ry="5.5" fill="#E6A800" opacity="0.28"/>
      <ellipse cx="47" cy="108" rx="4.5" ry="5.5" fill="#E6A800" opacity="0.22"/>
      <ellipse cx="56" cy="106" rx="4.5" ry="5.5" fill="#E6A800" opacity="0.22"/>
      <ellipse cx="65" cy="106" rx="4.5" ry="5.5" fill="#E6A800" opacity="0.22"/>
      <ellipse cx="74" cy="108" rx="4.5" ry="5.5" fill="#E6A800" opacity="0.22"/>
      <ellipse cx="51" cy="120" rx="4.5" ry="5.5" fill="#E6A800" opacity="0.16"/>
      <ellipse cx="60" cy="118" rx="4.5" ry="5.5" fill="#E6A800" opacity="0.16"/>
      <ellipse cx="69" cy="120" rx="4.5" ry="5.5" fill="#E6A800" opacity="0.16"/>

      {/* 얼굴 하이라이트 */}
      <ellipse cx="60" cy="90" rx="20" ry="22" fill="#FFE44D" opacity="0.55"/>

      {/* 눈 */}
      <circle cx="53" cy="84" r="5.5" fill="#2D2D2D"/>
      <circle cx="67" cy="84" r="5.5" fill="#2D2D2D"/>
      <circle cx="55" cy="82" r="2.2" fill="white"/>
      <circle cx="69" cy="82" r="2.2" fill="white"/>
      <circle cx="54" cy="85.5" r="1" fill="white" opacity="0.6"/>
      <circle cx="68" cy="85.5" r="1" fill="white" opacity="0.6"/>

      {/* 눈썹 */}
      <path d="M48 77 Q53 74 58 77" stroke="#2D2D2D" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M62 77 Q67 74 72 77" stroke="#2D2D2D" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

      {/* 미소 */}
      <path d="M51 97 Q60 105 69 97" stroke="#2D2D2D" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

      {/* 볼터치 */}
      <ellipse cx="43" cy="93" rx="6.5" ry="4" fill="#FFB7C5" opacity="0.65"/>
      <ellipse cx="77" cy="93" rx="6.5" ry="4" fill="#FFB7C5" opacity="0.65"/>

      {/* 왼쪽 잎사귀 */}
      <path d="M30 118 Q6 90 20 60 Q35 88 42 115 Z" fill="#52B788" stroke="#40916C" strokeWidth="1.5"/>
      <path d="M32 126 Q10 99 18 72 Q32 96 40 123 Z" fill="#74C69D" stroke="#52B788" strokeWidth="1"/>

      {/* 오른쪽 잎사귀 */}
      <path d="M90 118 Q114 90 100 60 Q85 88 78 115 Z" fill="#52B788" stroke="#40916C" strokeWidth="1.5"/>
      <path d="M88 126 Q110 99 102 72 Q88 96 80 123 Z" fill="#74C69D" stroke="#52B788" strokeWidth="1"/>
    </svg>
  )
}
