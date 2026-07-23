import { type Home } from '@/types/home'

export function getHealthScore(home: Home): number {
  let score = 100

  // Kota penaltisi
  if (home.quotaUsagePercent >= 100) {
    score -= Math.min(40, (home.quotaUsagePercent - 100) * 0.5)
  } else if (home.quotaUsagePercent >= 80) {
    score -= (home.quotaUsagePercent - 80) * 0.5
  }

  // Anomalous cihaz penaltisi
  const anomalousCount = home.appliances.filter((a) => a.consecutiveBreaches >= 3).length
  score -= anomalousCount * 15

  // Penalty tarife aktifse
  if (home.penaltyActive) {
    score -= 10
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

export function getHealthLabel(score: number): string {
  if (score >= 80) return 'İyi'
  if (score >= 60) return 'Orta'
  if (score >= 40) return 'Riskli'
  return 'Kritik'
}

export function getHealthColor(score: number): string {
  if (score >= 80) return 'var(--color-semantic-success)'
  if (score >= 60) return 'var(--color-primary)'
  if (score >= 40) return 'var(--color-semantic-warning)'
  return 'var(--color-semantic-error)'
}
