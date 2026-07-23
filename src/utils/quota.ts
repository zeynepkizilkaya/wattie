export type QuotaState = 'normal' | 'warning' | 'breach'

export function getQuotaState(usagePercent: number): QuotaState {
  if (usagePercent >= 100) return 'breach'
  if (usagePercent >= 80) return 'warning'
  return 'normal'
}

export function isAnomalous(consecutiveBreaches: number): boolean {
  return consecutiveBreaches >= 3
}
