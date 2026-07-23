export interface Appliance {
  id: string
  name: string
  currentWatt: number
  safeLimit: number
  consecutiveBreaches: number
}

export interface Home {
  id: string
  name: string
  contactEmail?: string
  quotaUsagePercent: number
  totalConsumptionKwh: number
  billingAmountTry: number
  penaltyActive: boolean
  appliances: Appliance[]
}

export interface DailyConsumption {
  date: string
  consumptionKwh: number
}

export interface CreateHomeRequest {
  name: string
  email: string
  appliances: { name: string; safeLimit: number }[]
}

export interface AddApplianceRequest {
  name: string
  safeLimit: number
}

export interface Notification {
  id: string
  homeId: string
  homeName: string
  type: 'quota_warning' | 'quota_breach' | 'anomaly' | 'recommendation'
  message: string
  createdAt: string
  read: boolean
}

export interface Recommendation {
  id: string
  homeId: string
  type: 'energy_saving' | 'anomaly_alert' | 'quota_warning' | 'general'
  title: string
  message: string
  createdAt: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  currentPage: number
  size: number
}
