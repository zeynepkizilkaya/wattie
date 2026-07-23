export function formatKwh(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(2)} MWh`
  if (value >= 100) return `${value.toFixed(0)} kWh`
  return `${value.toFixed(1)} kWh`
}

export function formatCurrency(value: number): string {
  if (value >= 10000) return `${(value / 1000).toFixed(1)}k ₺`
  return `${value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺`
}

export function formatWatt(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)} kW`
  return `${value.toFixed(0)} W`
}
