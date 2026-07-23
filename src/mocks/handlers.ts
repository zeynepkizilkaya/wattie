import { http, HttpResponse, delay } from 'msw'
import { mockUsers, mockHomes, generateHistory, generateApplianceId, generateHomeId } from './data'
import { calculateBilling } from '@/utils/billing'
import { type Home } from '@/types/home'

// Mock notifications array
const mockNotifications = [
  {
    id: 'n1',
    homeId: 'h2',
    homeName: 'Yazlık - Bodrum',
    type: 'quota_warning',
    message: 'Kota kullanımı %80 seviyesini aştı.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: 'n2',
    homeId: 'h3',
    homeName: 'Ofis - Levent',
    type: 'quota_breach',
    message: 'Kota limiti aşıldı. Ceza tarifesi uygulanıyor.',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    read: false,
  },
  {
    id: 'n3',
    homeId: 'h7',
    homeName: 'Villa - Sarıyer',
    type: 'anomaly',
    message: 'Merkezi Isıtma cihazında anormal tüketim tespit edildi (6 ardışık ihlal).',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    read: false,
  },
  {
    id: 'n4',
    homeId: 'h8',
    homeName: 'Depo - Tuzla',
    type: 'anomaly',
    message: 'Soğuk Hava Deposu cihazında anormal tüketim tespit edildi (8 ardışık ihlal).',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    read: false,
  },
  {
    id: 'n5',
    homeId: 'h5',
    homeName: 'Müstakil - Çekmeköy',
    type: 'recommendation',
    message: 'Isı Pompası evin toplam tüketiminin %45\'ini oluşturuyor. Enerji verimli bir modele geçiş düşünün.',
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    read: false,
  },
]

let nextNotificationId = 6

// Track triggered notifications to avoid duplicates
const triggeredNotifications = new Set<string>()

// Initialize with existing states
for (const home of mockHomes) {
  if (home.quotaUsagePercent >= 80) {
    triggeredNotifications.add(`${home.id}-quota_warning`)
  }
  if (home.quotaUsagePercent >= 100) {
    triggeredNotifications.add(`${home.id}-quota_breach`)
  }
  for (const appliance of home.appliances) {
    if (appliance.consecutiveBreaches >= 3) {
      triggeredNotifications.add(`${home.id}-${appliance.id}-anomaly`)
    }
  }
}

function simulateRealTimeFluctuation() {
  for (const home of mockHomes) {
    const prevQuotaUsage = home.quotaUsagePercent

    for (const appliance of home.appliances) {
      const prevBreaches = appliance.consecutiveBreaches
      const fluctuation = (Math.random() - 0.5) * appliance.safeLimit * 0.1
      appliance.currentWatt = Math.max(0, appliance.currentWatt + fluctuation)
      appliance.currentWatt = Math.round(appliance.currentWatt * 10) / 10

      if (appliance.currentWatt > appliance.safeLimit) {
        appliance.consecutiveBreaches++
      } else if (appliance.consecutiveBreaches > 0 && Math.random() > 0.7) {
        appliance.consecutiveBreaches = 0
      }

      // Check if appliance just reached 3 consecutive breaches
      if (appliance.consecutiveBreaches >= 3 && prevBreaches < 3) {
        const key = `${home.id}-${appliance.id}-anomaly`
        if (!triggeredNotifications.has(key)) {
          triggeredNotifications.add(key)
          mockNotifications.unshift({
            id: `n${nextNotificationId++}`,
            homeId: home.id,
            homeName: home.name,
            type: 'anomaly',
            message: `${appliance.name} cihazında anormal tüketim tespit edildi (${appliance.consecutiveBreaches} ardışık ihlal).`,
            createdAt: new Date().toISOString(),
            read: false,
          })
        }
      }
    }

    const totalWatt = home.appliances.reduce((sum, a) => sum + a.currentWatt, 0)
    home.totalConsumptionKwh += totalWatt * 0.0005
    home.totalConsumptionKwh = Math.round(home.totalConsumptionKwh * 100) / 100

    home.quotaUsagePercent += (Math.random() - 0.3) * 0.2
    home.quotaUsagePercent = Math.round(home.quotaUsagePercent * 10) / 10
    home.quotaUsagePercent = Math.max(0, home.quotaUsagePercent)

    home.penaltyActive = home.quotaUsagePercent >= 100
    home.billingAmountTry = calculateBilling(home.totalConsumptionKwh, home.quotaUsagePercent)

    // Check if home just crossed 80% quota
    if (prevQuotaUsage < 80 && home.quotaUsagePercent >= 80) {
      const key = `${home.id}-quota_warning`
      if (!triggeredNotifications.has(key)) {
        triggeredNotifications.add(key)
        mockNotifications.unshift({
          id: `n${nextNotificationId++}`,
          homeId: home.id,
          homeName: home.name,
          type: 'quota_warning',
          message: 'Kota kullanımı %80 seviyesini aştı.',
          createdAt: new Date().toISOString(),
          read: false,
        })
      }
    }

    // Check if home just crossed 100% quota
    if (prevQuotaUsage < 100 && home.quotaUsagePercent >= 100) {
      const key = `${home.id}-quota_breach`
      if (!triggeredNotifications.has(key)) {
        triggeredNotifications.add(key)
        mockNotifications.unshift({
          id: `n${nextNotificationId++}`,
          homeId: home.id,
          homeName: home.name,
          type: 'quota_breach',
          message: 'Kota limiti aşıldı. Ceza tarifesi uygulanıyor.',
          createdAt: new Date().toISOString(),
          read: false,
        })
      }
    }
  }
}

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const handlers = [
  // Auth - Login
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    await delay(400)
    const body = await request.json() as { email: string; password: string }

    const user = mockUsers.find(
      (u) => u.email === body.email && u.password === body.password
    )

    if (!user) {
      return HttpResponse.json(
        { message: 'Geçersiz e-posta veya şifre.' },
        { status: 401 }
      )
    }

    const token = `mock-jwt-${Date.now()}`

    return HttpResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  }),

  // Auth - Signup
  http.post(`${BASE}/auth/signup`, async ({ request }) => {
    await delay(500)
    const body = await request.json() as { name: string; email: string; password: string }

    const existing = mockUsers.find((u) => u.email === body.email)
    if (existing) {
      return HttpResponse.json(
        { message: 'Bu e-posta zaten kayıtlı.' },
        { status: 409 }
      )
    }

    const newUser = {
      id: String(mockUsers.length + 1),
      name: body.name,
      email: body.email,
      password: body.password,
    }
    mockUsers.push(newUser)

    const token = `mock-jwt-${Date.now()}`

    return HttpResponse.json({
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    })
  }),

  // Homes - List (polling endpoint, paginated)
  http.get(`${BASE}/homes`, async ({ request }) => {
    await delay(100)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    simulateRealTimeFluctuation()

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0', 10)
    const size = parseInt(url.searchParams.get('size') || '10', 10)

    const total = mockHomes.length
    const start = page * size
    const end = start + size
    const content = mockHomes.slice(start, end)

    return HttpResponse.json({
      content,
      totalPages: Math.ceil(total / size),
      totalElements: total,
      currentPage: page,
      size,
    })
  }),

  // Homes - Create
  http.post(`${BASE}/homes`, async ({ request }) => {
    await delay(300)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as {
      name: string
      email: string
      appliances: Array<{ name: string; safeLimit: number }>
    }

    const newHome: Home = {
      id: generateHomeId(),
      name: body.name,
      contactEmail: body.email,
      quotaUsagePercent: 0,
      totalConsumptionKwh: 0,
      billingAmountTry: 0,
      penaltyActive: false,
      appliances: body.appliances.map((a) => ({
        id: generateApplianceId(),
        name: a.name,
        currentWatt: Math.random() * a.safeLimit * 0.5,
        safeLimit: a.safeLimit,
        consecutiveBreaches: 0,
      })),
    }

    mockHomes.push(newHome)

    return HttpResponse.json(newHome, { status: 201 })
  }),

  // Homes - History
  http.get(`${BASE}/homes/:id/history`, async ({ params }) => {
    await delay(200)
    const { id } = params
    const history = generateHistory(id as string)
    return HttpResponse.json(history)
  }),

  // Homes - Hourly consumption distribution
  http.get(`${BASE}/homes/:id/hourly`, async ({ params }) => {
    await delay(150)
    const { id } = params
    const home = mockHomes.find(h => h.id === id)
    if (!home) {
      return HttpResponse.json({ message: 'Konut bulunamadı.' }, { status: 404 })
    }

    const totalWatt = home.appliances.reduce((sum, a) => sum + a.currentWatt, 0)
    const data = Array.from({ length: 24 }, (_, hour) => {
      const isNight = hour >= 22 || hour < 6
      const isPeak = hour >= 18 && hour <= 21
      let base = totalWatt * 0.4
      if (isNight) base *= 0.3
      if (isPeak) base *= 1.6
      const variation = base * (0.8 + Math.sin(hour * 0.5) * 0.2 + (hour % 3) * 0.05)
      return { hour, consumptionWh: Math.round(variation) }
    })

    return HttpResponse.json(data)
  }),

  // Homes - Recommendations
  http.get(`${BASE}/homes/:id/recommendations`, async ({ params }) => {
    await delay(200)

    const { id } = params
    const home = mockHomes.find((h) => h.id === id)

    if (!home) {
      return HttpResponse.json({ message: 'Konut bulunamadı.' }, { status: 404 })
    }

    const recommendations: Array<{
      id: string
      homeId: string
      type: string
      title: string
      message: string
      createdAt: string
    }> = []

    let index = 0

    // If home has penalty active
    if (home.penaltyActive) {
      recommendations.push({
        id: `rec-${home.id}-${index}`,
        homeId: home.id,
        type: 'quota_warning',
        title: 'Kota Aşım Uyarısı',
        message: `${home.name} için kota kullanımı %${home.quotaUsagePercent} seviyesinde. Tüketimi azaltarak ceza tarifesinden kaçının.`,
        createdAt: new Date().toISOString(),
      })
      index++
    }

    // If home has anomalous appliances
    const anomalousAppliances = home.appliances.filter((a) => a.consecutiveBreaches >= 3)
    for (const appliance of anomalousAppliances) {
      recommendations.push({
        id: `rec-${home.id}-${index}`,
        homeId: home.id,
        type: 'anomaly_alert',
        title: 'Cihaz Anomalisi',
        message: `${appliance.name} cihazı ${appliance.consecutiveBreaches} ardışık ihlal gerçekleştirdi. Cihazı kontrol edin veya güvenli limiti gözden geçirin.`,
        createdAt: new Date().toISOString(),
      })
      index++
    }

    // Always include: energy saving tip for highest consuming appliance
    const sortedByWatt = [...home.appliances].sort((a, b) => b.currentWatt - a.currentWatt)
    const highest = sortedByWatt[0]
    if (highest) {
      const totalWatt = home.appliances.reduce((sum, a) => sum + a.currentWatt, 0)
      const percentage = totalWatt > 0 ? Math.round((highest.currentWatt / totalWatt) * 100) : 0
      recommendations.push({
        id: `rec-${home.id}-${index}`,
        homeId: home.id,
        type: 'energy_saving',
        title: 'Tasarruf Önerisi',
        message: `${highest.name} evin toplam tüketiminin %${percentage}'ini oluşturuyor. Kullanım saatlerini optimize edin veya enerji verimli bir alternatif değerlendirin.`,
        createdAt: new Date().toISOString(),
      })
      index++
    }

    // General assessment
    recommendations.push({
      id: `rec-${home.id}-${index}`,
      homeId: home.id,
      type: 'general',
      title: 'Genel Değerlendirme',
      message: `${home.name} toplam ${home.totalConsumptionKwh} kWh tüketim gerçekleştirdi. Kota kullanımı %${home.quotaUsagePercent} seviyesinde.`,
      createdAt: new Date().toISOString(),
    })

    return HttpResponse.json(recommendations)
  }),

  // Notifications - List (paginated)
  http.get(`${BASE}/notifications`, async ({ request }) => {
    await delay(150)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0', 10)
    const size = parseInt(url.searchParams.get('size') || '10', 10)

    const total = mockNotifications.length
    const start = page * size
    const end = start + size
    const content = mockNotifications.slice(start, end)

    return HttpResponse.json({
      content,
      totalPages: Math.ceil(total / size),
      totalElements: total,
      currentPage: page,
      size,
    })
  }),

  // Notifications - Mark as read
  http.put(`${BASE}/notifications/:id/read`, async ({ params }) => {
    await delay(100)

    const { id } = params
    const notification = mockNotifications.find((n) => n.id === id)

    if (!notification) {
      return new HttpResponse(null, { status: 404 })
    }

    notification.read = true

    return new HttpResponse(null, { status: 204 })
  }),

  // Appliances - Add
  http.post(`${BASE}/homes/:homeId/appliances`, async ({ params, request }) => {
    await delay(300)

    const { homeId } = params
    const home = mockHomes.find((h) => h.id === homeId)

    if (!home) {
      return HttpResponse.json({ message: 'Konut bulunamadı.' }, { status: 404 })
    }

    const body = await request.json() as { name: string; safeLimit: number }

    const newAppliance = {
      id: generateApplianceId(),
      name: body.name,
      currentWatt: Math.random() * body.safeLimit * 0.4,
      safeLimit: body.safeLimit,
      consecutiveBreaches: 0,
    }

    home.appliances.push(newAppliance)

    return HttpResponse.json(newAppliance, { status: 201 })
  }),

  // Homes - Delete
  http.delete(`${BASE}/homes/:homeId`, async ({ params }) => {
    await delay(300)
    const { homeId } = params
    const index = mockHomes.findIndex(h => h.id === homeId)
    if (index === -1) {
      return HttpResponse.json({ message: 'Konut bulunamadı.' }, { status: 404 })
    }
    mockHomes.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // Appliances - Update
  http.put(`${BASE}/homes/:homeId/appliances/:applianceId`, async ({ params, request }) => {
    await delay(200)
    const { homeId, applianceId } = params
    const home = mockHomes.find(h => h.id === homeId)
    if (!home) return HttpResponse.json({ message: 'Konut bulunamadı.' }, { status: 404 })
    const appliance = home.appliances.find(a => a.id === applianceId)
    if (!appliance) return HttpResponse.json({ message: 'Cihaz bulunamadı.' }, { status: 404 })
    const body = await request.json() as { safeLimit: number }
    appliance.safeLimit = body.safeLimit
    return new HttpResponse(null, { status: 204 })
  }),

  // Appliances - Remove
  http.delete(`${BASE}/homes/:homeId/appliances/:applianceId`, async ({ params }) => {
    await delay(200)

    const { homeId, applianceId } = params
    const home = mockHomes.find((h) => h.id === homeId)

    if (!home) {
      return HttpResponse.json({ message: 'Konut bulunamadı.' }, { status: 404 })
    }

    const index = home.appliances.findIndex((a) => a.id === applianceId)
    if (index === -1) {
      return HttpResponse.json({ message: 'Cihaz bulunamadı.' }, { status: 404 })
    }

    home.appliances.splice(index, 1)

    return new HttpResponse(null, { status: 204 })
  }),
]
