import React from 'react'

interface DeviceStatusProps {
  status: 'online' | 'offline'
}

export function DeviceStatus({ status }: DeviceStatusProps) {
  const isOnline = status === 'online'

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      padding: '0.3rem 0.65rem',
      borderRadius: '0px',
      fontSize: '0.72rem',
      fontWeight: 600,
      background: isOnline ? 'var(--color-primary-subtle)' : 'var(--color-error-subtle)',
      color: isOnline ? 'var(--color-semantic-success)' : 'var(--color-semantic-error)',
      border: isOnline ? '1px solid var(--color-semantic-success)' : '1px solid var(--color-semantic-error)'
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: isOnline ? 'var(--color-semantic-success)' : 'var(--color-semantic-error)',
        display: 'inline-block'
      }} />
      {status.toUpperCase()}
    </div>
  )
}
