import React, { useMemo } from 'react'

interface DeviceImageProps {
  iconName: string
  isOnline: boolean
}

export function DeviceImage({ iconName, isOnline }: DeviceImageProps) {
  const svg = useMemo(() => {
    const nameLower = iconName.toLowerCase()
    if (nameLower.includes('refrigerator')) {
      return (
        <svg viewBox="0 0 60 90" width="60" height="90" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))' }}>
          <polygon points="5,15 25,5 25,85 5,75" fill="#0f172a" />
          <polygon points="25,5 45,12 45,45 25,38" fill="#38bdf8" />
          <polygon points="45,12 55,9 55,42 45,45" fill="#0ea5e9" />
          <polygon points="25,41 45,48 45,80 25,73" fill="#0284c7" />
          <polygon points="45,48 55,45 55,77 45,80" fill="#0369a1" />
          <line x1="43" y1="20" x2="43" y2="35" stroke="#f1f5f9" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="43" y1="53" x2="43" y2="68" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          <polygon points="25,5 45,12 55,9 35,2" fill="#7dd3fc" />
        </svg>
      )
    }
    if (nameLower.includes('monitor') || nameLower.includes('computer')) {
      return (
        <svg viewBox="0 0 80 80" width="80" height="80" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))' }}>
          <polygon points="5,60 75,60 65,75 15,75" fill="#1e1b4b" opacity="0.6" />
          <polygon points="36,45 44,45 42,58 38,58" fill="#4f46e5" />
          <polygon points="30,58 50,58 48,62 32,62" fill="#3730a3" />
          <polygon points="15,15 65,15 65,45 15,45" fill="#4338ca" />
          <polygon points="18,17 62,17 62,42 18,42" fill="#1e1b4b" />
          <polygon points="22,20 58,20 58,38 22,38" fill="url(#panelScreenGrad)" opacity="0.8" />
          <polygon points="25,64 55,64 52,69 28,69" fill="#1e1b4b" />
          <polygon points="26,65 54,65 51,68 29,68" fill="#818cf8" opacity="0.5" />
          <polygon points="58,66 63,66 62,68 59,68" fill="#818cf8" />
          <defs>
            <linearGradient id="panelScreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      )
    }
    if (nameLower.includes('tv') || nameLower.includes('television')) {
      return (
        <svg viewBox="0 0 80 80" width="80" height="80" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))' }}>
          <polygon points="10,50 70,50 65,65 15,65" fill="#581c87" />
          <line x1="15" y1="65" x2="15" y2="70" stroke="#3b0764" strokeWidth="2.5" />
          <line x1="65" y1="65" x2="65" y2="70" stroke="#3b0764" strokeWidth="2.5" />
          <polygon points="15,58 65,58 64,59 16,59" fill="#c084fc" opacity="0.4" />
          <rect x="37" y="42" width="6" height="8" fill="#6b21a8" />
          <polygon points="32,48 48,48 46,50 34,50" fill="#581c87" />
          <polygon points="8,15 72,15 72,42 8,42" fill="#3b0764" />
          <polygon points="10,17 70,17 70,40 10,40" fill="#1e152a" />
          <polygon points="10,17 70,17 70,40 10,40" fill="url(#panelTvGrad)" opacity="0.75" />
          <defs>
            <linearGradient id="panelTvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#06101b" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>
      )
    }
    if (nameLower.includes('lightbulb') || nameLower.includes('lights') || nameLower.includes('lamp')) {
      return (
        <svg viewBox="0 0 80 90" width="70" height="78" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))' }}>
          <polygon points="30,80 50,80 48,83 32,83" fill="#d97706" />
          <line x1="40" y1="35" x2="40" y2="80" stroke="#b45309" strokeWidth="2.5" />
          <polygon points="28,35 52,35 58,15 22,15" fill="#f59e0b" />
          <polygon points="30,17 50,17 48,33 32,33" fill="#fef08a" opacity="0.3" />
          <circle cx="40" cy="40" r="12" fill="url(#panelLampGlow)" opacity="0.5" />
          <defs>
            <radialGradient id="panelLampGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      )
    }
    // Kitchen (Flame)
    return (
      <svg viewBox="0 0 80 90" width="70" height="78" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))' }}>
        <polygon points="20,5 60,5 65,22 15,22" fill="#7c2d12" />
        <polygon points="15,22 65,22 60,26 20,26" fill="url(#panelHoodGlow)" opacity="0.4" />
        <polygon points="15,50 65,50 65,85 15,85" fill="#451a03" />
        <polygon points="15,50 65,50 60,56 20,56" fill="#1c1917" />
        <ellipse cx="30" cy="53" rx="6" ry="2" fill="#ea580c" opacity="0.8" />
        <ellipse cx="50" cy="53" rx="5" ry="1.8" fill="#ea580c" opacity="0.8" />
        <circle cx="22" cy="62" r="2" fill="#fdba74" />
        <circle cx="32" cy="62" r="2" fill="#fdba74" />
        <circle cx="48" cy="62" r="2" fill="#fdba74" />
        <circle cx="58" cy="62" r="2" fill="#fdba74" />
        <polygon points="22,68 58,68 58,80 22,80" fill="#1c1917" />
        <polygon points="24,70 56,70 56,78 24,78" fill="#f97316" opacity="0.15" />
        <line x1="28" y1="67" x2="52" y2="67" stroke="#fdba74" strokeWidth="2.5" strokeLinecap="round" />
        <defs>
          <linearGradient id="panelHoodGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    )
  }, [iconName])

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '140px',
      borderRadius: '0px',
      background: 'var(--color-surface-2)',
      border: '1px solid var(--color-hairline)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: isOnline ? 'rgba(99, 102, 241, 0.15)' : 'rgba(156, 163, 175, 0.05)',
        filter: 'blur(30px)',
        zIndex: 1
      }} />

      {/* Vector Illustration */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        transform: 'scale(1.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {svg}
      </div>
    </div>
  )
}
