import { useNavigate, useSearchParams } from 'react-router-dom'
import { TopNav } from '@/components/TopNav'
import { useHomes } from '@/hooks/useHomes'
import { CarbonHomeSelect } from '@/components/CarbonHomeSelect'
import { ArrowLeft, Lightbulb, LineChart, Sun, Clock, Sparkles, Box } from 'lucide-react'
import styles from './HousePage.module.css'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useState, useRef, useMemo, useEffect, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { InteriorModel } from '../hero/InteriorModel'
import { CAMERA_PRESETS } from '../config/roomPresets'
import { DeviceInfoPanel } from '../components/DeviceInfoPanel/DeviceInfoPanel'
import { MOCK_TELEMETRY } from '../components/DeviceInfoPanel/mockData'
import { useTheme } from '@/hooks/useTheme'
import { formatWatt } from '@/utils/format'

function Waveform({ color }: { color: string }) {
  return (
    <svg width="60" height="12" viewBox="0 0 60 12" fill="none" style={{ opacity: 0.85 }}>
      <motion.path
        d="M0 6 Q 6 1, 12 6 T 24 6 T 36 6 T 48 6 T 60 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        animate={{
          d: [
            "M0 6 Q 6 1, 12 6 T 24 6 T 36 6 T 48 6 T 60 6",
            "M0 6 Q 6 11, 12 6 T 24 6 T 36 6 T 48 6 T 60 6",
            "M0 6 Q 6 1, 12 6 T 24 6 T 36 6 T 48 6 T 60 6"
          ]
        }}
        transition={{
          repeat: Infinity,
          duration: 1.6,
          ease: "easeInOut"
        }}
      />
    </svg>
  )
}

interface DeviceCardProps {
  id: string
  name: string
  roomName: string
  isSelected?: boolean
  onClick?: () => void
  onPowerToggle?: (status: 'online' | 'offline') => void
  deviceState: any
}

function DeviceCard({ id, name, roomName, isSelected = false, onClick, onPowerToggle, deviceState }: DeviceCardProps) {
  const [hovered, setHovered] = useState(false)
  const telemetry = deviceState

  const config = useMemo(() => {
    switch (id) {
      case 'refrigerator':
        return {
          accentColor: '#38bdf8', // Ice Blue
          glowColor: 'rgba(56, 189, 248, 0.25)',
          svg: (
            <svg viewBox="0 0 60 90" width="44" height="66" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
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
      case 'computer':
        return {
          accentColor: '#818cf8', // Indigo
          glowColor: 'rgba(129, 140, 248, 0.25)',
          svg: (
            <svg viewBox="0 0 80 80" width="56" height="56" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
              <polygon points="5,60 75,60 65,75 15,75" fill="#1e1b4b" opacity="0.6" />
              <polygon points="36,45 44,45 42,58 38,58" fill="#4f46e5" />
              <polygon points="30,58 50,58 48,62 32,62" fill="#3730a3" />
              <polygon points="15,15 65,15 65,45 15,45" fill="#4338ca" />
              <polygon points="18,17 62,17 62,42 18,42" fill="#1e1b4b" />
              <polygon points="22,20 58,20 58,38 22,38" fill="url(#screenGrad)" opacity="0.8" />
              <polygon points="25,64 55,64 52,69 28,69" fill="#1e1b4b" />
              <polygon points="26,65 54,65 51,68 29,68" fill="#818cf8" opacity="0.5" />
              <polygon points="58,66 63,66 62,68 59,68" fill="#818cf8" />
              <defs>
                <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          )
        }
      case 'television':
        return {
          accentColor: '#c084fc', // Lavender
          glowColor: 'rgba(192, 132, 252, 0.25)',
          svg: (
            <svg viewBox="0 0 80 80" width="56" height="56" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
              <polygon points="10,50 70,50 65,65 15,65" fill="#581c87" />
              <line x1="15" y1="65" x2="15" y2="70" stroke="#3b0764" strokeWidth="2.5" />
              <line x1="65" y1="65" x2="65" y2="70" stroke="#3b0764" strokeWidth="2.5" />
              <polygon points="15,58 65,58 64,59 16,59" fill="#c084fc" opacity="0.4" />
              <rect x="37" y="42" width="6" height="8" fill="#6b21a8" />
              <polygon points="32,48 48,48 46,50 34,50" fill="#581c87" />
              <polygon points="8,15 72,15 72,42 8,42" fill="#3b0764" />
              <polygon points="10,17 70,17 70,40 10,40" fill="#1e152a" />
              <polygon points="10,17 70,17 70,40 10,40" fill="url(#tvGrad)" opacity="0.75" />
              <defs>
                <linearGradient id="tvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#818cf8" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#06101b" stopOpacity="0.9" />
                </linearGradient>
              </defs>
            </svg>
          )
        }
      case 'lights':
        return {
          accentColor: '#fbbf24', // Warm Yellow / Gold
          glowColor: 'rgba(251, 191, 36, 0.25)',
          svg: (
            <svg viewBox="0 0 80 90" width="50" height="56" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
              <polygon points="30,80 50,80 48,83 32,83" fill="#d97706" />
              <line x1="40" y1="35" x2="40" y2="80" stroke="#b45309" strokeWidth="2.5" />
              <polygon points="28,35 52,35 58,15 22,15" fill="#f59e0b" />
              <polygon points="30,17 50,17 48,33 32,33" fill="#fef08a" opacity="0.3" />
              <circle cx="40" cy="40" r="12" fill="url(#lampGlow)" opacity="0.5" />
              <defs>
                <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          )
        }
      case 'air_conditioner':
        return {
          accentColor: '#06b6d4', // Cyan
          glowColor: 'rgba(6, 182, 212, 0.25)',
          svg: (
            <svg viewBox="0 0 80 80" width="56" height="56" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
              <rect x="10" y="20" width="60" height="30" rx="4" fill="#155e75" />
              <rect x="14" y="24" width="52" height="22" rx="2" fill="#083344" />
              <line x1="20" y1="36" x2="60" y2="36" stroke="#06b6d4" strokeWidth="2" strokeDasharray="3 2" />
              <circle cx="60" cy="28" r="2" fill="#10b981" />
              <path d="M 25,50 Q 30,62 35,50 T 45,50 T 55,50" fill="none" stroke="#67e8f9" strokeWidth="2" opacity="0.7" />
            </svg>
          )
        }
      case 'washing_machine':
        return {
          accentColor: '#a855f7', // Purple
          glowColor: 'rgba(168, 85, 247, 0.25)',
          svg: (
            <svg viewBox="0 0 80 80" width="56" height="56" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
              <rect x="15" y="15" width="50" height="55" rx="4" fill="#581c87" />
              <circle cx="40" cy="48" r="16" fill="#3b0764" stroke="#a855f7" strokeWidth="3" />
              <circle cx="40" cy="48" r="10" fill="#a855f7" opacity="0.3" />
              <circle cx="24" cy="24" r="3" fill="#e9d5ff" />
              <circle cx="32" cy="24" r="2" fill="#e9d5ff" />
            </svg>
          )
        }
      case 'oven':
        return {
          accentColor: '#fb923c',
          glowColor: 'rgba(251, 146, 60, 0.25)',
          svg: (
            <svg viewBox="0 0 80 90" width="50" height="56" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
              <polygon points="20,5 60,5 65,22 15,22" fill="#7c2d12" />
              <polygon points="15,22 65,22 60,26 20,26" fill="#f97316" opacity="0.4" />
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
            </svg>
          )
        }
      case 'heater':
        return {
          accentColor: '#ef4444',
          glowColor: 'rgba(239, 68, 68, 0.25)',
          svg: (
            <svg viewBox="0 0 80 80" width="56" height="56" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
              <rect x="15" y="20" width="50" height="45" rx="3" fill="#7f1d1d" />
              <rect x="20" y="25" width="4" height="35" rx="2" fill="#ef4444" />
              <rect x="28" y="25" width="4" height="35" rx="2" fill="#ef4444" />
              <rect x="36" y="25" width="4" height="35" rx="2" fill="#ef4444" />
              <rect x="44" y="25" width="4" height="35" rx="2" fill="#ef4444" />
              <rect x="52" y="25" width="4" height="35" rx="2" fill="#ef4444" />
              <rect x="15" y="65" width="50" height="6" rx="1" fill="#991b1b" />
              <path d="M 25,12 Q 28,8 31,12 T 37,12 T 43,12" fill="none" stroke="#fca5a5" strokeWidth="1.5" opacity="0.7" />
            </svg>
          )
        }
      case 'jacuzzi':
        return {
          accentColor: '#14b8a6',
          glowColor: 'rgba(20, 184, 166, 0.25)',
          svg: (
            <svg viewBox="0 0 80 80" width="56" height="56" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
              <ellipse cx="40" cy="50" rx="28" ry="16" fill="#134e4a" />
              <ellipse cx="40" cy="47" rx="25" ry="13" fill="#0d9488" opacity="0.5" />
              <path d="M 22,44 Q 28,38 34,44 T 46,44 T 58,44" fill="none" stroke="#5eead4" strokeWidth="2" opacity="0.8" />
              <path d="M 25,48 Q 31,42 37,48 T 49,48 T 55,48" fill="none" stroke="#99f6e4" strokeWidth="1.5" opacity="0.5" />
              <circle cx="30" cy="38" r="2" fill="#ccfbf1" opacity="0.6" />
              <circle cx="45" cy="36" r="1.5" fill="#ccfbf1" opacity="0.6" />
              <circle cx="50" cy="40" r="1.8" fill="#ccfbf1" opacity="0.6" />
            </svg>
          )
        }
      case 'ev_charger':
        return {
          accentColor: '#22c55e',
          glowColor: 'rgba(34, 197, 94, 0.25)',
          svg: (
            <svg viewBox="0 0 80 80" width="56" height="56" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
              <rect x="25" y="15" width="30" height="50" rx="3" fill="#14532d" />
              <rect x="30" y="20" width="20" height="12" rx="2" fill="#166534" />
              <circle cx="40" cy="26" r="4" fill="#22c55e" />
              <rect x="33" y="38" width="14" height="8" rx="2" fill="#052e16" stroke="#22c55e" strokeWidth="1.5" />
              <path d="M 38,40 L 36,44 L 39,44 L 37,47 L 43,42 L 40,42 L 42,40 Z" fill="#4ade80" />
              <rect x="37" y="52" width="6" height="10" rx="1" fill="#166534" />
              <circle cx="40" cy="58" r="2" fill="#22c55e" opacity="0.6" />
            </svg>
          )
        }
      case 'sauna':
        return {
          accentColor: '#d97706',
          glowColor: 'rgba(217, 119, 6, 0.25)',
          svg: (
            <svg viewBox="0 0 80 80" width="56" height="56" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
              <rect x="15" y="25" width="50" height="40" rx="3" fill="#78350f" />
              <rect x="18" y="28" width="44" height="34" fill="#92400e" />
              <rect x="20" y="30" width="40" height="5" rx="1" fill="#b45309" />
              <rect x="20" y="37" width="40" height="5" rx="1" fill="#b45309" />
              <rect x="20" y="44" width="40" height="5" rx="1" fill="#b45309" />
              <path d="M 30,18 Q 32,12 34,18" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.7" />
              <path d="M 38,16 Q 40,10 42,16" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.7" />
              <path d="M 46,18 Q 48,12 50,18" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.7" />
              <circle cx="55" cy="55" r="5" fill="#451a03" />
              <circle cx="55" cy="55" r="3" fill="#f59e0b" opacity="0.5" />
            </svg>
          )
        }
      case 'dryer':
        return {
          accentColor: '#8b5cf6',
          glowColor: 'rgba(139, 92, 246, 0.25)',
          svg: (
            <svg viewBox="0 0 80 80" width="56" height="56" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
              <rect x="15" y="15" width="50" height="55" rx="4" fill="#4c1d95" />
              <circle cx="40" cy="45" r="16" fill="#2e1065" stroke="#8b5cf6" strokeWidth="2.5" />
              <circle cx="40" cy="45" r="10" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="4 3" />
              <circle cx="24" cy="24" r="3" fill="#ddd6fe" />
              <circle cx="32" cy="24" r="2" fill="#ddd6fe" />
              <rect x="50" y="22" width="8" height="3" rx="1" fill="#ddd6fe" />
            </svg>
          )
        }
      case 'water_heater':
        return {
          accentColor: '#f97316',
          glowColor: 'rgba(249, 115, 22, 0.25)',
          svg: (
            <svg viewBox="0 0 80 90" width="50" height="56" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
              <rect x="25" y="10" width="30" height="60" rx="15" fill="#7c2d12" />
              <rect x="28" y="14" width="24" height="52" rx="12" fill="#9a3412" />
              <circle cx="40" cy="55" r="6" fill="#ea580c" opacity="0.6" />
              <path d="M 37,50 Q 40,44 43,50" fill="none" stroke="#fdba74" strokeWidth="2" />
              <rect x="35" y="72" width="10" height="8" rx="2" fill="#451a03" />
              <circle cx="40" cy="28" r="4" fill="#1c1917" stroke="#fb923c" strokeWidth="1.5" />
            </svg>
          )
        }
      default:
        return {
          accentColor: '#64748b',
          glowColor: 'rgba(100, 116, 139, 0.25)',
          svg: (
            <svg viewBox="0 0 80 80" width="56" height="56" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
              <rect x="20" y="20" width="40" height="40" rx="4" fill="#334155" />
              <circle cx="40" cy="40" r="10" fill="none" stroke="#94a3b8" strokeWidth="2" />
              <path d="M 36,40 L 40,36 L 44,40 L 40,44 Z" fill="#94a3b8" />
              <circle cx="32" cy="28" r="2" fill="#64748b" />
              <circle cx="48" cy="28" r="2" fill="#64748b" />
            </svg>
          )
        }
    }
  }, [id])

  const { accentColor, glowColor, svg } = config
  const isOnline = telemetry?.status === 'online'
  const currentPower = telemetry?.currentPower ?? 0

  return (
    <motion.div
      className={styles.deviceCard}
      role="button"
      tabIndex={0}
      aria-label={`${name} — ${roomName}`}
      aria-pressed={isSelected}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      whileHover={{ y: -4, scale: 1.03 }}
      animate={{
        borderColor: isSelected ? accentColor : 'var(--color-hairline)',
        background: isSelected
          ? 'var(--color-surface-2)'
          : hovered
            ? 'var(--color-surface-2)'
            : 'var(--color-surface-1)'
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.85rem 1rem',
        borderRadius: '0px',
        border: '1px solid var(--color-hairline)',
        cursor: 'pointer',
        width: '100%',
        height: '115px',
        userSelect: 'none',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48px',
        height: '64px',
        flexShrink: 0,
        transition: 'transform 0.3s ease',
        transform: hovered ? 'scale(1.05)' : 'scale(1)'
      }}>
        {svg}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        flex: 1,
        minWidth: 0,
        gap: '0.2rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.05rem' }}>
          <span style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--color-ink)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {name}
          </span>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--color-ink-muted)',
            fontWeight: 400
          }}>
            {roomName}
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '0.15rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: isOnline ? 'var(--color-semantic-success)' : 'var(--color-semantic-error)',
                          }} />
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: isOnline ? 'var(--color-semantic-success)' : 'var(--color-semantic-error)',
              fontFamily: 'monospace'
            }}>
              {isOnline ? `${currentPower} W` : '0 W'}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onPowerToggle?.(isOnline ? 'offline' : 'online')
            }}
            style={{
              borderRadius: '0px',
              padding: '3px 8px',
              fontSize: '0.68rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: isOnline ? 'var(--color-primary-subtle)' : 'var(--color-error-subtle)',
              color: isOnline ? 'var(--color-semantic-success)' : 'var(--color-semantic-error)',
              border: isOnline ? '1px solid var(--color-semantic-success)' : '1px solid var(--color-semantic-error)',
              transition: 'all 0.2s ease'
            }}
          >
            {isOnline ? 'ON' : 'OFF'}
          </button>
        </div>

        {isOnline && (
          <div style={{ marginTop: '2px' }}>
            <Waveform color={accentColor} />
          </div>
        )}
      </div>
    </motion.div>
  )
}

function CameraController({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  useFrame(() => {
    // Always update controls to keep manual interaction and damping smooth
    if (controlsRef.current) {
      controlsRef.current.update()
    }
  })

  return null
}

function CameraRefHolder({ cameraRef }: { cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null> }) {
  const { camera } = useThree()
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      cameraRef.current = camera
    }
  }, [camera, cameraRef])
  return null
}


export function HousePage() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const homeId = searchParams.get('homeId') || ''

  const { homes, loading: homesLoading } = useHomes()

  const currentHome = useMemo(() => {
    if (homes.length === 0) return null
    return homes.find(h => h.id === 'h1' || h.name.includes('Kadıköy')) ?? homes[0]!
  }, [homes])

  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null)
  const controlsRef = useRef<any>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)

  const [deviceStates, setDeviceStates] = useState<Record<string, any>>({})

  // Callback to toggle power status and update demand power
  const handlePowerToggle = useCallback((deviceId: string, status: 'online' | 'offline') => {
    const defaultPowerValues: Record<string, number> = {
      refrigerator: 85,
      computer: 145,
      television: 110,
      oven: 98,
      lights: 28
    }
    setDeviceStates(prev => {
      const updatedDevice = { ...prev[deviceId] }
      updatedDevice.status = status
      updatedDevice.currentPower = status === 'online' ? (defaultPowerValues[deviceId] || 50) : 0
      return {
        ...prev,
        [deviceId]: updatedDevice
      }
    })
  }, [])

  // Left Smart Panel Clock State
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  // Left Smart Panel Live Status state (ticks up every second)
  const [lastUpdatedSec, setLastUpdatedSec] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdatedSec(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Reset "last updated" timer whenever any device state changes
  useEffect(() => {
    setLastUpdatedSec(0)
  }, [deviceStates])


  const activeAppliances = useMemo(() => {
    if (!currentHome) return []
    return currentHome.appliances.map((app) => {
      const normName = app.name.toLowerCase().trim()
      let presetId = app.id
      let room = 'Ev'
      let cameraPresetId = 'whole_house'

      if (app.id === 'refrigerator' || normName.includes('buzdolabı')) {
        presetId = 'refrigerator'
        room = 'Mutfak'
        cameraPresetId = 'kitchen'
      } else if (app.id === 'computer' || normName.includes('bilgisayar') || normName.includes('laptop')) {
        presetId = 'computer'
        room = 'Çalışma Odası'
        cameraPresetId = 'office'
      } else if (app.id === 'television' || normName.includes('televizyon') || normName.includes('tv')) {
        presetId = 'television'
        room = 'Salon'
        cameraPresetId = 'living_room'
      } else if (app.id === 'oven' || normName.includes('fırın')) {
        presetId = 'oven'
        room = 'Mutfak'
        cameraPresetId = 'kitchen'
      } else if (app.id === 'lights' || normName.includes('aydınlatma') || normName.includes('lamba')) {
        presetId = 'lights'
        room = 'Salon'
        cameraPresetId = 'living_room'
      } else if (app.id === 'air_conditioner' || normName.includes('klima')) {
        presetId = 'air_conditioner'
        room = 'İklimlendirme'
        cameraPresetId = 'climate'
      } else if (app.id === 'washing_machine' || normName.includes('çamaşır')) {
        presetId = 'washing_machine'
        room = 'Çamaşır Odası'
        cameraPresetId = 'laundry'
      } else if (normName.includes('bulaşık')) {
        presetId = 'dishwasher'
        room = 'Mutfak'
        cameraPresetId = 'kitchen'
      } else if (normName.includes('ısıtma') || normName.includes('isitma') || normName.includes('kalorifer')) {
        presetId = 'heater'
        room = 'Ev'
        cameraPresetId = 'whole_house'
      } else if (normName.includes('jakuzi') || normName.includes('küvet')) {
        presetId = 'jacuzzi'
        room = 'Banyo'
        cameraPresetId = 'whole_house'
      } else if (normName.includes('araç') || normName.includes('şarj') || normName.includes('ev şarj')) {
        presetId = 'ev_charger'
        room = 'Garaj'
        cameraPresetId = 'whole_house'
      } else if (normName.includes('sauna')) {
        presetId = 'sauna'
        room = 'Ev'
        cameraPresetId = 'whole_house'
      } else if (normName.includes('kurutma')) {
        presetId = 'dryer'
        room = 'Çamaşır Odası'
        cameraPresetId = 'laundry'
      } else if (normName.includes('şofben') || normName.includes('termosifon')) {
        presetId = 'water_heater'
        room = 'Banyo'
        cameraPresetId = 'whole_house'
      }

      return {
        id: app.id,
        presetId,
        name: app.name,
        room,
        cameraPresetId,
        currentWatt: app.currentWatt,
        safeLimit: app.safeLimit,
        consecutiveBreaches: app.consecutiveBreaches
      }
    })
  }, [currentHome?.appliances])

  useEffect(() => {
    if (!currentHome) return
    setDeviceStates(prev => {
      const next = { ...prev }
      currentHome.appliances.forEach(app => {
        const matched = activeAppliances.find(a => a.id === app.id)
        if (!next[app.id]) {
          const normName = app.name.toLowerCase().trim()
          let mockKey = 'refrigerator'
          let defaultPower = 140
          let defaultSafeLimit = app.safeLimit || 250

          if (normName.includes('klima')) { mockKey = 'air_conditioner'; defaultPower = 1650; defaultSafeLimit = 2000 }
          else if (normName.includes('fırın')) { mockKey = 'oven'; defaultPower = 1850; defaultSafeLimit = 2200 }
          else if (normName.includes('çamaşır')) { mockKey = 'washing_machine'; defaultPower = 1800; defaultSafeLimit = 2200 }
          else if (normName.includes('bulaşık')) { mockKey = 'dishwasher'; defaultPower = 1500; defaultSafeLimit = 1800 }
          else if (normName.includes('bilgisayar')) { mockKey = 'computer'; defaultPower = 220; defaultSafeLimit = 400 }
          else if (normName.includes('tv') || normName.includes('televizyon')) { mockKey = 'television'; defaultPower = 120; defaultSafeLimit = 200 }
          else if (normName.includes('aydınlatma')) { mockKey = 'lights'; defaultPower = 32; defaultSafeLimit = 80 }
          else if (normName.includes('buzdolabı')) { mockKey = 'refrigerator'; defaultPower = 140; defaultSafeLimit = 250 }

          const baseMock = MOCK_TELEMETRY[mockKey] || MOCK_TELEMETRY.refrigerator || MOCK_TELEMETRY.television
          next[app.id] = {
            ...(baseMock || {}),
            id: app.id,
            name: app.name,
            room: matched?.room || 'Ev',
            currentPower: app.currentWatt > 0 ? Math.round(app.currentWatt) : defaultPower,
            safeLimit: defaultSafeLimit,
            status: 'online',
            todayConsumption: parseFloat(((app.currentWatt * 0.008) || 1.2).toFixed(2))
          }
        } else {
          next[app.id].currentPower = Math.round(app.currentWatt)
          next[app.id].safeLimit = app.safeLimit || next[app.id].safeLimit || 2000
          if (matched) next[app.id].room = matched.room
        }
      })
      return next
    })
  }, [currentHome?.appliances, activeAppliances])

  // Hover state for mesh highlighting
  const [hoveredDeviceId, setHoveredDeviceId] = useState<string | null>(null)

  const activeDevice = activeAppliances.find((d) => d.id === activeDeviceId || d.presetId === activeDeviceId)
  const activePreset = activeDevice ? CAMERA_PRESETS[activeDevice.cameraPresetId] : null

  const selectedDeviceState = useMemo(() => {
    if (!activeDeviceId) return null
    if (deviceStates[activeDeviceId]) return deviceStates[activeDeviceId]
    const app = activeAppliances.find(a => a.id === activeDeviceId || a.presetId === activeDeviceId)
    if (app && deviceStates[app.id]) return deviceStates[app.id]
    return MOCK_TELEMETRY[activeDeviceId] || MOCK_TELEMETRY.refrigerator
  }, [activeDeviceId, deviceStates, activeAppliances])

  const handleDeviceClick = (deviceId: string) => {
    const dev = activeAppliances.find(d => d.id === deviceId || d.presetId === deviceId)
    if (!dev) return
    setActiveDeviceId((prev) => (prev === dev.id ? null : dev.id))
  }

  const consumers = useMemo(() => {
    const colors: Record<string, string> = {
      refrigerator: '#38bdf8',
      computer: '#818cf8',
      television: '#c084fc',
      lights: '#fbbf24',
      air_conditioner: '#06b6d4',
      washing_machine: '#a855f7',
      oven: '#fb923c',
      heater: '#ef4444',
      jacuzzi: '#14b8a6',
      ev_charger: '#22c55e',
      sauna: '#d97706',
      dryer: '#8b5cf6',
      water_heater: '#f97316'
    }
    return activeAppliances
      .map(app => {
        const data = deviceStates[app.id]
        return {
          name: app.name,
          power: data?.status === 'online' ? data.currentPower : 0,
          color: colors[app.presetId] || '#38bdf8'
        }
      })
      .sort((a, b) => b.power - a.power)
  }, [activeAppliances, deviceStates])

  // Calculate total current consumption and today's energy dynamically from activeAppliances
  const { totalCurrentPower, totalTodayEnergy, onlineCount } = useMemo(() => {
    let power = 0
    let energy = 0
    let online = 0
    activeAppliances.forEach((app) => {
      const data = deviceStates[app.id]
      if (data) {
        if (data.status === 'online') {
          power += data.currentPower
          online += 1
        }
        energy += (data.todayConsumption || 0.5)
      }
    })
    return {
      totalCurrentPower: power,
      totalTodayEnergy: parseFloat(energy.toFixed(2)),
      onlineCount: online
    }
  }, [activeAppliances, deviceStates])

  // Dynamic live daily energy trend curve computed from totalCurrentPower & current system time
  const liveDailyTrend = useMemo(() => {
    const totalW = totalCurrentPower || 0
    const currentHour = time.getHours() + time.getMinutes() / 60
    const currentHourX = Math.round((currentHour / 24) * 300)

    if (totalW === 0) {
      return { 
        path: 'M 0,85 L 300,85', 
        area: 'M 0,85 L 300,85 L 300,95 L 0,95 Z', 
        activeX: currentHourX,
        activeY: 85,
        currentHourStr: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    }

    // Dynamic wattage scale factor (maps 0-5000W to SVG Y 15 to 80)
    const wattScale = Math.min(Math.max(totalW / 60, 10), 65)

    // Diurnal consumption curve (lower at 00-06, peak at 12-18)
    const y00 = Math.max(15, 85 - wattScale * 0.3)
    const y06 = Math.max(15, 85 - wattScale * 0.45)
    const y12 = Math.max(15, 85 - wattScale * 0.95)
    const y18 = Math.max(15, 85 - wattScale * 0.80)
    const y24 = Math.max(15, 85 - wattScale * 0.50)

    const path = `M 0,${y00.toFixed(1)} C 40,${y06.toFixed(1)} 110,${y12.toFixed(1)} 150,${y12.toFixed(1)} C 190,${y12.toFixed(1)} 260,${y18.toFixed(1)} 300,${y24.toFixed(1)}`
    const area = `${path} L 300,95 L 0,95 Z`

    // Interpolate active Y position along current time X position
    const progress = currentHour / 24
    let activeY = 85
    if (progress <= 0.25) {
      activeY = y00 + (y06 - y00) * (progress / 0.25)
    } else if (progress <= 0.5) {
      activeY = y06 + (y12 - y06) * ((progress - 0.25) / 0.25)
    } else if (progress <= 0.75) {
      activeY = y12 + (y18 - y12) * ((progress - 0.5) / 0.25)
    } else {
      activeY = y18 + (y24 - y18) * ((progress - 0.75) / 0.25)
    }

    return {
      path,
      area,
      activeX: currentHourX,
      activeY: Math.round(activeY),
      currentHourStr: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }, [totalCurrentPower, time])


  if (homesLoading || !currentHome) {
    return (
      <div className={styles.page}>
        <TopNav />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--color-ink-muted)', fontSize: '1rem' }}>
          Yükleniyor...
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <TopNav />
      <div className={styles.container}>
        {/* Top Header Bar */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{
                fontSize: '1.8rem',
                fontWeight: 600,
                margin: 0,
                color: 'var(--color-ink)',
                letterSpacing: '-0.02em'
              }}>
                {currentHome.name}
              </h1>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '2px 10px',
                borderRadius: '0px',
                background: currentHome.quotaUsagePercent > 100 ? 'var(--color-error-subtle)' : 'var(--color-primary-subtle)',
                color: currentHome.quotaUsagePercent > 100 ? 'var(--color-semantic-error)' : 'var(--color-semantic-success)',
                border: currentHome.quotaUsagePercent > 100 ? '1px solid var(--color-semantic-error)' : '1px solid var(--color-semantic-success)'
              }}>
                %{currentHome.quotaUsagePercent.toFixed(1)} Kota Kullanımı
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-ink-muted)', margin: 0 }}>
              {activeDevice ? `Cihaz İzleme: ${activeDevice.name} (${activeDevice.room})` : '3D ev modelinizi gezebilir, oda kestirmelerini kullanabilir veya cihazları kontrol edebilirsiniz.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                background: 'rgba(15, 98, 254, 0.15)',
                color: 'var(--color-primary, #0f62fe)',
                border: '1px solid rgba(15, 98, 254, 0.4)',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <Box size={14} />
              <span>3D Dijital İkiz Destekli Konut</span>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.2rem',
                borderRadius: '0px',
                backgroundColor: 'var(--color-surface-1)',
                color: 'var(--color-ink)',
                border: '1px solid var(--color-hairline)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 400,
                transition: 'all 0.2s ease',
                              }}
            >
              <ArrowLeft size={16} />
              Dashboard'a Dön
            </button>
          </div>
        </header>

        {/* 4 KPI Summary Cards Bar */}
        <div className={styles.kpiGrid}>
          {/* Status Card */}
          <div style={{
            background: 'var(--color-surface-1)',
            border: '1px solid var(--color-hairline)',
            borderRadius: '0px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '0px',
              background: 'var(--color-primary-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-semantic-success)'
            }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-semantic-success)',
                              }} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Konut Durumu
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-ink)', marginTop: '0.15rem' }}>
                {onlineCount}/5 Cihaz Aktif
              </div>
            </div>
          </div>

          {/* Live Power Usage */}
          <div style={{
            background: 'var(--color-surface-1)',
            border: '1px solid var(--color-hairline)',
            borderRadius: '0px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '0px',
              background: 'var(--color-primary-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Anlık Yük Tüketimi
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-ink)', marginTop: '0.15rem', fontFamily: 'monospace' }}>
                {totalCurrentPower} W
              </div>
            </div>
          </div>

          {/* Today's Energy */}
          <div style={{
            background: 'var(--color-surface-1)',
            border: '1px solid var(--color-hairline)',
            borderRadius: '0px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '0px',
              background: 'var(--color-primary-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
                <path d="M17 2v5" />
                <path d="M7 2v5" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Bugünkü Toplam
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-ink)', marginTop: '0.15rem', fontFamily: 'monospace' }}>
                {totalTodayEnergy} kWh
              </div>
            </div>
          </div>

          {/* System Health */}
          <div style={{
            background: 'var(--color-surface-1)',
            border: '1px solid var(--color-hairline)',
            borderRadius: '0px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '0px',
              background: 'var(--color-primary-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Sağlık Skoru
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-semantic-success)', marginTop: '0.15rem' }}>
                Mükemmel (%98)
              </div>
            </div>
          </div>
        </div>

        {/* Middle Main Section: 2 Column Grid (Center Stage Canvas 1fr + Right Side Panel 340px) */}
        <div className={styles.mainGrid}>
          {/* Main Center 3D Stage Viewport (540px Height Container) */}
          <main style={{
            background: 'var(--color-surface-1)',
            border: '1px solid var(--color-hairline)',
            borderRadius: '0px',
            position: 'relative',
            height: '540px',
            overflow: 'hidden',
                      }}>



            {/* Futuristic Status Badge Overlay */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              zIndex: 10,
              fontSize: '0.78rem',
              fontFamily: 'monospace',
              color: 'rgba(255, 255, 255, 0.5)',
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(10px)',
              padding: '4px 10px',
              borderRadius: '0px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {activeDevice ? `SYS.VIEWPORT.3D [FOCUS: ${activeDevice.name.toUpperCase()}]` : 'SYS.VIEWPORT.3D [INTERACTIVE STAGE]'}
            </div>

            {/* Three.js Canvas Container */}
            <div style={{ width: '100%', height: '100%', position: 'relative' }} aria-hidden="true">
              <Canvas
                shadows
                camera={{ position: [8, 5, 8], fov: 40 }}
                gl={{
                  antialias: true,
                  toneMapping: THREE.ACESFilmicToneMapping,
                  toneMappingExposure: 1.2
                }}
              >
                <color attach="background" args={[theme === 'dark' ? '#06101b' : '#f8fafc']} />
                <ambientLight intensity={0.4} color="#8ba0c3" />
                <directionalLight
                  position={[5, 10, 5]}
                  intensity={1.5}
                  color="#7ea2d5"
                  castShadow
                  shadow-mapSize={[1024, 1024]}
                />
                <Suspense fallback={null}>
                  <Environment preset="city" />
                  <InteriorModel
                    position={[0, -1.8, 0]}
                    scale={0.045}
                    onMeshClick={handleDeviceClick}
                    activeDeviceId={activeAppliances.find(d => d.id === activeDeviceId)?.presetId ?? null}
                    hoveredDeviceId={hoveredDeviceId}
                    onHoverChange={setHoveredDeviceId}
                    deviceStates={deviceStates}
                  />
                </Suspense>
                <CameraRefHolder cameraRef={cameraRef} />
                <CameraController controlsRef={controlsRef} />
                <OrbitControls ref={controlsRef} enabled={true} enableDamping dampingFactor={0.05} minDistance={0.01} maxDistance={500} enablePan={true} screenSpacePanning={true} />
              </Canvas>
            </div>
          </main>

          {/* Right Side Utility Column (340px width) */}
          <aside style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {/* Weather Widget Card */}
            <div style={{
              background: 'var(--color-surface-1)',
              border: '1px solid var(--color-hairline)',
              borderRadius: '0px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>29°C</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)', fontWeight: 400 }}>Güneşli</span>
                </div>
                <Sun size={34} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.4))' }} />
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-ink)', borderTop: '1px solid var(--color-hairline)', paddingTop: '0.5rem' }}>
                İstanbul
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-surface-2)', padding: '0.5rem 0.65rem', borderRadius: '0px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-ink-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Nem</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-ink)', marginTop: '0.1rem' }}>%46</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-surface-2)', padding: '0.5rem 0.65rem', borderRadius: '0px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-ink-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Rüzgar</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-ink)', marginTop: '0.1rem' }}>14 km/s</span>
                </div>
              </div>
            </div>

            {/* Clock & Live Status Card */}
            <div style={{
              background: 'var(--color-surface-1)',
              border: '1px solid var(--color-hairline)',
              borderRadius: '0px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-ink-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <Clock size={15} color="#38bdf8" />
                  <span>Sistem Saati</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-semantic-success)' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-semantic-success)' }}>CANLI</span>
                </div>
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 600, color: 'var(--color-ink)', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)', fontWeight: 400 }}>
                {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
            </div>

            {/* AI Energy Insight Card - Dynamic Live Data */}
            <div style={{
              background: 'var(--color-surface-1)',
              border: '1px solid var(--color-hairline)',
              borderRadius: '0px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                <Sparkles size={16} />
                <span>WATTIE AI ENERJİ ANALİZİ</span>
              </div>
              <div style={{
                fontSize: '0.92rem',
                fontWeight: 600,
                color: currentHome && currentHome.quotaUsagePercent > 100 ? 'var(--color-semantic-error)' : 'var(--color-semantic-success)'
              }}>
                {currentHome && currentHome.quotaUsagePercent > 100 ? '⚠️ Kota Aşımı Uyarısı' : '✅ Optilmize Tüketim Modu'}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)', margin: 0, lineHeight: 1.5 }}>
                {currentHome ? (
                  <>
                    Anlık bütçe kotası <strong style={{ color: currentHome.quotaUsagePercent > 100 ? 'var(--color-semantic-error)' : 'var(--color-semantic-success)' }}>%{currentHome.quotaUsagePercent.toFixed(1)}</strong> seviyesinde. Kayıtlı <strong>{activeAppliances.length} cihaz</strong> canlı olarak izleniyor.
                  </>
                ) : (
                  'Konut verileri canlı olarak izleniyor.'
                )}
              </p>
            </div>
          </aside>
        </div>

        {/* Bottom Interactive Appliance Shelf */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚡ Akıllı Cihaz Kontrol Rafı</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)', fontWeight: 400 }}>(Cihaza tıklayarak detay ve güç durumunu değiştirebilirsiniz)</span>
          </div>
          <div className={styles.deviceGrid}>
            {activeAppliances.map((device) => (
              <DeviceCard
                key={device.id}
                id={device.presetId}
                name={device.name}
                roomName={device.room}
                isSelected={activeDeviceId === device.id}
                onClick={() => handleDeviceClick(device.id)}
                onPowerToggle={(status) => handlePowerToggle(device.id, status)}
                deviceState={deviceStates[device.id]}
              />
            ))}
          </div>
        </section>

        {/* Real-time Analytics Cards Grid */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '1.5rem',
          marginTop: '0.5rem'
        }}>
          {/* Energy Trend Card */}
          <div style={{
            background: 'var(--color-surface-1)',
            border: '1px solid var(--color-hairline)',
            borderRadius: '0px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-ink)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderBottom: '1px solid var(--color-hairline)',
              paddingBottom: '0.65rem'
            }}>
              <LineChart size={16} color="#38bdf8" />
              <span>Günlük Enerji Trendi (Today)</span>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}>
              <svg viewBox="0 0 300 100" width="100%" height="120" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <line x1="0" y1="20" x2="300" y2="20" stroke="var(--color-hairline)" strokeWidth="1" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="var(--color-hairline)" strokeWidth="1" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="var(--color-hairline)" strokeWidth="1" />
                <path
                  d={liveDailyTrend.path}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d={liveDailyTrend.area}
                  fill="url(#chartGrad)"
                />
                <circle cx={liveDailyTrend.activeX} cy={liveDailyTrend.activeY} r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-ink-muted)', fontFamily: 'monospace' }}>
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>24:00</span>
            </div>
          </div>

          {/* Top Consumers Card */}
          <div style={{
            background: 'var(--color-surface-1)',
            border: '1px solid var(--color-hairline)',
            borderRadius: '0px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-ink)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderBottom: '1px solid var(--color-hairline)',
              paddingBottom: '0.65rem'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <span>En Yüksek Güç Çeken Cihazlar</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {consumers.map((c, i) => {
                const maxPower = consumers[0]?.power || 1
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                      <span>{c.name}</span>
                      <span style={{ fontFamily: 'monospace' }}>{formatWatt(c.power)}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--color-surface-2)', borderRadius: '0px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min((c.power / maxPower) * 100, 100)}%`,
                          background: c.color,
                          borderRadius: '0px',
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Animated Side Device Info Panel */}
        <AnimatePresence>
          {activeDeviceId && selectedDeviceState && (
            <DeviceInfoPanel
              deviceId={activeDeviceId}
              onClose={() => setActiveDeviceId(null)}
              deviceState={selectedDeviceState}
              onPowerToggle={handlePowerToggle}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
