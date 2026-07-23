const BASE_RATE = 2.45

const PENALTY_TIERS = [
  { threshold: 160, multiplier: 2.5 },
  { threshold: 140, multiplier: 2.0 },
  { threshold: 120, multiplier: 1.5 },
  { threshold: 100, multiplier: 1.25 },
]

export function getPenaltyMultiplier(quotaPercent: number): number {
  if (quotaPercent < 100) return 1.0
  for (const tier of PENALTY_TIERS) {
    if (quotaPercent >= tier.threshold) return tier.multiplier
  }
  return 1.0
}

export function getEffectiveRate(quotaPercent: number): number {
  return BASE_RATE * getPenaltyMultiplier(quotaPercent)
}

export function calculateBilling(totalKwh: number, quotaPercent: number): number {
  return Math.round(totalKwh * getEffectiveRate(quotaPercent) * 100) / 100
}

export function getPenaltyTierLabel(quotaPercent: number): string {
  if (quotaPercent < 100) return 'Normal Tarife'
  if (quotaPercent < 120) return 'Ceza Kademe 1'
  if (quotaPercent < 140) return 'Ceza Kademe 2'
  if (quotaPercent < 160) return 'Ceza Kademe 3'
  return 'Ceza Kademe 4'
}

export { BASE_RATE }
