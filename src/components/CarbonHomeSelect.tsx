import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Home as HomeIcon, Box } from 'lucide-react'
import { type Home } from '@/types/home'
import styles from './CarbonHomeSelect.module.css'

interface CarbonHomeSelectProps {
  homes: Home[]
  currentHome: Home
  onSelectHome: (homeId: string) => void
}

export function CarbonHomeSelect({ homes, currentHome, onSelectHome }: CarbonHomeSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className={styles.triggerLeft}>
          <HomeIcon size={16} className={styles.homeIcon} />
          <span className={styles.triggerName}>{currentHome.name}</span>
          {(currentHome.id === 'h1' || currentHome.name.includes('Kadıköy')) && (
            <span
              style={{
                fontSize: '0.7rem',
                background: 'rgba(15, 98, 254, 0.15)',
                color: 'var(--color-primary, #0f62fe)',
                border: '1px solid rgba(15, 98, 254, 0.4)',
                padding: '1px 6px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <Box size={10} /> 3D İkiz
            </span>
          )}
          <span
            className={`${styles.quotaTag} ${
              currentHome.quotaUsagePercent > 100 ? styles.quotaOver : styles.quotaNormal
            }`}
          >
            %{currentHome.quotaUsagePercent.toFixed(0)} Kota
          </span>
        </div>
        <div className={styles.arrowWrapper}>
          <ChevronDown size={16} className={`${styles.arrow} ${open ? styles.arrowRotated : ''}`} />
        </div>
      </button>

      {open && (
        <ul className={styles.menu} role="listbox">
          {homes.map((home) => {
            const isSelected = home.id === currentHome.id
            const isOverQuota = home.quotaUsagePercent > 100
            const has3dModel = home.id === 'h1' || home.name.includes('Kadıköy')
            return (
              <li
                key={home.id}
                role="option"
                aria-selected={isSelected}
                className={`${styles.menuItem} ${isSelected ? styles.selectedItem : ''}`}
                onClick={() => {
                  onSelectHome(home.id)
                  setOpen(false)
                }}
              >
                <div className={styles.itemLeft}>
                  {isSelected && <div className={styles.activeBar} />}
                  <HomeIcon size={15} className={styles.itemHomeIcon} />
                  <span className={styles.itemName}>{home.name}</span>
                  {has3dModel && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        background: 'rgba(15, 98, 254, 0.15)',
                        color: 'var(--color-primary, #0f62fe)',
                        border: '1px solid rgba(15, 98, 254, 0.4)',
                        padding: '1px 5px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      <Box size={9} /> 3D İkiz
                    </span>
                  )}
                  <span
                    className={`${styles.quotaTag} ${
                      isOverQuota ? styles.quotaOver : styles.quotaNormal
                    }`}
                  >
                    %{home.quotaUsagePercent.toFixed(0)} Kota
                  </span>
                </div>
                {isSelected && <Check size={14} className={styles.checkIcon} />}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
