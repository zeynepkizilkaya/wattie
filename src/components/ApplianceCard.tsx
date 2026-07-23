import { useEffect, useState } from 'react'
import { type Appliance } from '@/types/home'
import { isAnomalous } from '@/utils/quota'
import { getApplianceIcon } from '@/utils/applianceIcons'
import { getEffectiveRate } from '@/utils/billing'
import styles from './ApplianceCard.module.css'

interface ApplianceCardProps {
  appliance: Appliance
  quotaPercent?: number
  onRemove?: (id: string) => void
  onUpdateLimit?: (id: string, newLimit: number) => void
}

export function ApplianceCard({ appliance, quotaPercent = 0, onRemove, onUpdateLimit }: ApplianceCardProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(appliance.safeLimit))

  useEffect(() => {
    if (!editing) setEditValue(String(appliance.safeLimit))
  }, [appliance.safeLimit, editing])

  const anomalous = isAnomalous(appliance.consecutiveBreaches)
  const usage = appliance.safeLimit > 0
    ? Math.min((appliance.currentWatt / appliance.safeLimit) * 100, 100)
    : 0
  const Icon = getApplianceIcon(appliance.name)
  const isOverLimit = appliance.safeLimit > 0 && appliance.currentWatt > appliance.safeLimit
  const hourlyCost = (appliance.currentWatt / 1000) * getEffectiveRate(quotaPercent)

  const circumference = 2 * Math.PI * 28
  const strokeDashoffset = circumference - (usage / 100) * circumference

  const ringColor = anomalous
    ? 'var(--color-semantic-error)'
    : usage >= 80
      ? 'var(--color-semantic-warning)'
      : 'var(--color-primary)'

  return (
    <div className={`${styles.card} ${anomalous ? styles.anomalous : ''}`}>
      {onRemove && (
        <button
          className={styles.removeBtn}
          onClick={() => onRemove(appliance.id)}
          aria-label={`${appliance.name} kaldır`}
        >
          ✕
        </button>
      )}

      <div className={styles.ring}>
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="var(--color-surface-2)"
            strokeWidth="4"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={ringColor}
            strokeWidth="4"
            strokeLinecap="square"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 32 32)"
            className={styles.progress}
          />
        </svg>
        <div className={styles.ringIcon}>
          <Icon size={20} color={anomalous ? 'var(--color-semantic-error)' : 'var(--color-ink)'} />
        </div>
      </div>

      <div className={styles.info}>
        <span className={styles.name}>{appliance.name}</span>
        <span className={styles.watt}>{appliance.currentWatt.toFixed(0)} W</span>
        {!editing ? (
          <span
            className={styles.limit}
            onClick={(e) => { e.stopPropagation(); if (onUpdateLimit) setEditing(true) }}
            title={onUpdateLimit ? 'Limiti düzenlemek için tıklayın' : undefined}
            style={onUpdateLimit ? { cursor: 'pointer' } : undefined}
          >
            / {appliance.safeLimit} W
          </span>
        ) : (
          <div className={styles.editRow} onClick={e => e.stopPropagation()}>
            <input
              className={styles.editInput}
              type="number"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              autoFocus
              min="0"
            />
            <button className={styles.editSave} onClick={() => {
              const val = Number(editValue)
              if (val > 0 && onUpdateLimit) {
                onUpdateLimit(appliance.id, val)
                setEditing(false)
              }
            }}>&#x2713;</button>
            <button className={styles.editCancel} onClick={() => { setEditing(false); setEditValue(String(appliance.safeLimit)) }}>&#x2715;</button>
          </div>
        )}
        <div className={styles.details}>
          {appliance.consecutiveBreaches > 0 && (
            <span className={`${styles.breachCounter} ${anomalous ? styles.breachDanger : styles.breachWarn}`}>
              İhlal: {appliance.consecutiveBreaches}{appliance.consecutiveBreaches < 3 ? '/3' : ''}
            </span>
          )}
          <span className={styles.tariff}>
            {isOverLimit ? 'Ceza Tarifesi' : 'Normal Tarife'}
          </span>
          <span className={styles.costEstimate}>
            ~{hourlyCost.toFixed(2)} ₺/saat
          </span>
        </div>
      </div>

      {anomalous && (
        <span className={styles.badge}>Anormal</span>
      )}
    </div>
  )
}
