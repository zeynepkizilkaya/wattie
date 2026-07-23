import { type AuthResponse, type LoginRequest, type SignupRequest } from '@/types/auth'
import { type Home, type DailyConsumption, type CreateHomeRequest, type AddApplianceRequest, type Notification, type Recommendation, type PaginatedResponse } from '@/types/home'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function getToken(): string | null {
  return localStorage.getItem('token')
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options?.headers as Record<string, string>),
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const isAuthEndpoint = path.startsWith('/auth/')
  if (res.status === 401 && !isAuthEndpoint) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
    throw new Error('Oturum süresi doldu.')
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(res.status, text || `API error: ${res.status}`)
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

export const api = {
  login: (body: LoginRequest) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  signup: (body: SignupRequest) =>
    request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),

  getHomes: (page = 0, size = 20) => request<PaginatedResponse<Home>>(`/homes?page=${page}&size=${size}`),

  getHomeHistory: (id: string, page = 0, size = 30) => request<DailyConsumption[]>(`/homes/${id}/history?page=${page}&size=${size}`),

  getHomeHourly: (id: string) => request<Array<{ hour: number; consumptionWh: number }>>(`/homes/${id}/hourly`),

  createHome: (body: CreateHomeRequest) =>
    request<Home>('/homes', { method: 'POST', body: JSON.stringify(body) }),

  addAppliance: (homeId: string, body: AddApplianceRequest) =>
    request<void>(`/homes/${homeId}/appliances`, { method: 'POST', body: JSON.stringify(body) }),

  removeAppliance: (homeId: string, applianceId: string) =>
    request<void>(`/homes/${homeId}/appliances/${applianceId}`, { method: 'DELETE' }),

  deleteHome: (id: string) => request<void>(`/homes/${id}`, { method: 'DELETE' }),

  updateAppliance: (homeId: string, applianceId: string, body: { safeLimit: number }) =>
    request<void>(`/homes/${homeId}/appliances/${applianceId}`, { method: 'PUT', body: JSON.stringify(body) }),

  getNotifications: (page = 0, size = 20) => request<PaginatedResponse<Notification>>(`/notifications?page=${page}&size=${size}`),

  markNotificationRead: (id: string) => request<void>(`/notifications/${id}/read`, { method: 'PUT' }),

  getRecommendations: (homeId: string) => request<Recommendation[]>(`/homes/${homeId}/recommendations`),
}
