import React from 'react'
import { DeviceImage } from './DeviceImage'
import { DeviceStatus } from './DeviceStatus'

interface DeviceHeaderProps {
  name: string
  room: string
  status: 'online' | 'offline'
  lastUpdated: string
  iconName: string
}

export function DeviceHeader({ name, room, status, lastUpdated, iconName }: DeviceHeaderProps) {
  const isOnline = status === 'online'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      borderBottom: '1px solid var(--color-hairline)',
      paddingBottom: '1.25rem'
    }}>
      <DeviceImage iconName={iconName} isOnline={isOnline} />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{
            fontSize: '1.35rem',
            fontWeight: 600,
            margin: 0,
            color: 'var(--color-ink)',
            letterSpacing: '-0.01em'
          }}>{name}</h2>
          <span style={{
            fontSize: '0.78rem',
            color: 'var(--color-ink-muted)',
            marginTop: '0.2rem',
            display: 'block'
          }}>
            Konum: <strong style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{room}</strong>
          </span>
        </div>

        <DeviceStatus status={status} />
      </div>

      <div style={{
        fontSize: '0.7rem',
        color: 'var(--color-ink-muted)',
        fontWeight: 400,
        marginTop: '-0.4rem'
      }}>
        Son güncelleme: {lastUpdated}
      </div>
    </div>
  )
}
