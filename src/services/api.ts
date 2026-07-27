import { type Home, type HomeStatus, type DailyConsumption, type CreateHomeRequest, type AddApplianceRequest, type Appliance, type EventLog } from '@/types/home'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400: return 'Geçersiz istek.'
    case 403: return 'Bu işlem için yetkiniz yok.'
    case 404: return 'Kaynak bulunamadı.'
    case 409: return 'Çakışma — lütfen tekrar deneyin.'
    case 422: return 'Gönderilen veri geçersiz.'
    case 429: return 'Çok fazla istek — lütfen biraz bekleyin.'
    case 500: case 502: case 503:
      return 'Sunucu hatası — lütfen daha sonra tekrar deneyin.'
    default: return 'Bir hata oluştu.'
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let message: string
    try {
      const json = JSON.parse(text)
      message = json.message || json.error || ''
    } catch {
      message = ''
    }
    if (!message || message.length > 200) {
      message = getDefaultErrorMessage(res.status)
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Backend raw types (before frontend transformation)
interface RawHome {
  id: number
  name: string
  address?: string
  contactEmail?: string
  powerQuotaKwh: number
  financialQuota: number
  normalTariffRate: number
  penaltyTariffRate: number
  createdAt?: string
}

interface RawAppliance {
  id: number
  name: string
  type?: string
  safeLimitWatts: number
  createdAt?: string
}

export const api = {
  getHomes: () => request<RawHome[]>('/homes'),

  getHomeStatus: (homeId: string) =>
    request<HomeStatus>(`/homes/${encodeURIComponent(homeId)}/status`),

  getHomeAppliances: (homeId: string) =>
    request<RawAppliance[]>(`/homes/${encodeURIComponent(homeId)}/appliances`),

  getHomeTrend: (homeId: string) =>
    request<DailyConsumption[]>(`/homes/${encodeURIComponent(homeId)}/trend`),

  getHomeEvents: (homeId: string) =>
    request<EventLog[]>(`/homes/${encodeURIComponent(homeId)}/events`),

  createHome: (body: CreateHomeRequest) =>
    request<{ id: number; name: string; message: string }>('/homes', { method: 'POST', body: JSON.stringify(body) }),

  addAppliance: (homeId: string, body: AddApplianceRequest) =>
    request<RawAppliance>(`/homes/${encodeURIComponent(homeId)}/appliances`, { method: 'POST', body: JSON.stringify(body) }),
}

// Transform raw backend data into frontend Home type
export function transformHome(
  raw: RawHome,
  status: HomeStatus | null,
  appliances: RawAppliance[],
  breachStates?: Map<string, number>
): Home {
  const totalKwh = status?.totalKwh ?? 0
  const totalCost = status?.totalCost ?? 0
  const penaltyActive = status?.penaltyActive ?? false

  const kwhRatio = raw.powerQuotaKwh > 0 ? totalKwh / raw.powerQuotaKwh : 0
  const costRatio = raw.financialQuota > 0 ? totalCost / raw.financialQuota : 0
  const quotaUsagePercent = Math.max(kwhRatio, costRatio) * 100

  return {
    id: String(raw.id),
    name: raw.name,
    address: raw.address,
    contactEmail: raw.contactEmail,
    powerQuotaKwh: raw.powerQuotaKwh,
    financialQuota: raw.financialQuota,
    normalTariffRate: raw.normalTariffRate,
    penaltyTariffRate: raw.penaltyTariffRate,
    quotaUsagePercent,
    totalConsumptionKwh: totalKwh,
    billingAmountTry: totalCost,
    penaltyActive,
    appliances: appliances.map(a => ({
      id: String(a.id),
      name: a.name,
      type: a.type,
      safeLimit: a.safeLimitWatts,
      currentWatt: 0,
      consecutiveBreaches: breachStates?.get(String(a.id)) ?? 0,
    })),
    createdAt: raw.createdAt,
  }
}
