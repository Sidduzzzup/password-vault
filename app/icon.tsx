export { metadata } from './layout'

export default function Icon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: '#4F46E5', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#7C3AED', stopOpacity: 1}} />
        </linearGradient>
      </defs>
      
      {/* Shield background */}
      <path 
        d="M50 10 L80 20 L80 45 Q80 70 50 90 Q20 70 20 45 L20 20 Z" 
        fill="url(#shieldGradient)" 
        stroke="#312E81" 
        strokeWidth="2"
      />
      
      {/* Lock body */}
      <rect x="40" y="48" width="20" height="18" rx="2" fill="#FFF" opacity="0.95"/>
      
      {/* Lock shackle */}
      <path 
        d="M 42 48 L 42 40 Q 42 32 50 32 Q 58 32 58 40 L 58 48" 
        stroke="#FFF" 
        strokeWidth="3" 
        fill="none" 
        opacity="0.95"
      />
      
      {/* Keyhole */}
      <circle cx="50" cy="55" r="2.5" fill="#4F46E5"/>
      <rect x="48.5" y="55" width="3" height="6" rx="1" fill="#4F46E5"/>
    </svg>
  )
}
