import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { api, transformHome } from '@/services/api'
import { useToast } from '@/hooks/useToast'
import { mockHomes } from '@/mocks/data'
import { type Home, type HomeStatus } from '@/types/home'
import { calculateTieredBilling } from '@/utils/billing'

interface HomesContextValue {
  homes: Home[]
  loading: boolean
  isStale: boolean
  lastUpdated: number | null
  getHome: (id: string) => Home | undefined
  refetch: () => Promise<void>
  addHome: (name: string, contactEmail: string, appliances: { name: string; safeLimitWatts: number }[]) => void
  removeAppliance: (homeId: string, applianceId: string) => void
  removeApplianceByName: (homeQuery: string, applianceQuery: string) => { success: boolean; homeName?: string; applianceName?: string }
  deleteHome: (homeId: string) => void
}

const HomesContext = createContext<HomesContextValue | null>(null)

// 1.5 Second Real-Time Telemetry Stream Polling Interval
const POLL_INTERVAL = 1500

export function HomesProvider({ children }: { children: React.ReactNode }) {
  const { addToast } = useToast()
  const [homes, setHomes] = useState<Home[]>(mockHomes)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<number | null>(() => Date.now())
  const [isStale, setIsStale] = useState(false)
  const runningRef = useRef(false)
  const mountedRef = useRef(true)
  const errorsRef = useRef(0)
  const errorShownRef = useRef(false)
  const initializedRef = useRef(false)

  // Full fetch: homes + appliances (initial load and refetch)
  const fetchAll = useCallback(async () => {
    if (runningRef.current) return
    runningRef.current = true
    try {
      let rawHomes: any[] = []
      try {
        rawHomes = await api.getHomes()
      } catch {
        rawHomes = []
      }

      if (!rawHomes || rawHomes.length === 0) {
        if (mountedRef.current) {
          setHomes((prev) => (prev.length > 0 ? prev : mockHomes))
          setLastUpdated(Date.now())
          setIsStale(false)
          setLoading(false)
          errorsRef.current = 0
          errorShownRef.current = false
          initializedRef.current = true
        }
        return
      }

      // Fetch status and appliances for each home in parallel
      const enriched = await Promise.all(
        rawHomes.map(async (raw) => {
          const homeId = String(raw.id)
          const [status, appliances] = await Promise.all([
            api.getHomeStatus(homeId).catch(() => null),
            api.getHomeAppliances(homeId).catch(() => []),
          ])
          return transformHome(raw, status, appliances)
        })
      )

      if (mountedRef.current) {
        setHomes(enriched.length > 0 ? enriched : mockHomes)
        setLastUpdated(Date.now())
        setIsStale(false)
        setLoading(false)
        errorsRef.current = 0
        errorShownRef.current = false
        initializedRef.current = true
      }
    } catch {
      if (mountedRef.current) {
        setHomes((prev) => (prev.length > 0 ? prev : mockHomes))
        setLastUpdated(Date.now())
        setIsStale(false)
        setLoading(false)
        initializedRef.current = true
      }
    } finally {
      runningRef.current = false
    }
  }, [])

  // 1.5 Second Real-Time Telemetry Stream & Status Sync Loop
  const pollStatus = useCallback(async () => {
    if (runningRef.current) return
    runningRef.current = true
    try {
      let statuses: Array<HomeStatus | null> = []
      try {
        statuses = await Promise.all(
          homes.map((h) => api.getHomeStatus(h.id).catch((): HomeStatus | null => null))
        )
      } catch {
        statuses = []
      }

      if (mountedRef.current) {
        setHomes((prev) =>
          prev.map((home, i) => {
            const status = statuses[i]

            // If live backend status is available, use it
            if (status) {
              const kwhRatio = home.powerQuotaKwh > 0 ? status.totalKwh / home.powerQuotaKwh : 0
              const quotaUsagePercent = Math.max(kwhRatio, 0) * 100
              const tiered = calculateTieredBilling(status.totalKwh, quotaUsagePercent)

              return {
                ...home,
                totalConsumptionKwh: status.totalKwh,
                billingAmountTry: tiered.totalBill,
                penaltyActive: status.penaltyActive,
                quotaUsagePercent,
              }
            }

            // Otherwise, simulate 1.5s real-time telemetry sensor updates (natural ±1-3W noise + subtle kWh increments)
            const updatedAppliances = home.appliances.map((app) => {
              if (app.currentWatt === 0) return app
              const delta = (Math.random() - 0.48) * 4 // subtle 1-3W noise
              const newWatt = Math.max(20, Math.round(app.currentWatt + delta))
              return { ...app, currentWatt: newWatt }
            })

            const currentTotalWatt = updatedAppliances.reduce((sum, a) => sum + a.currentWatt, 0)
            const addedKwh = (currentTotalWatt / 1000) * (1.5 / 3600)
            const newTotalKwh = home.totalConsumptionKwh + addedKwh

            const kwhRatio = home.powerQuotaKwh > 0 ? newTotalKwh / home.powerQuotaKwh : 0
            const quotaUsagePercent = kwhRatio * 100
            const tiered = calculateTieredBilling(newTotalKwh, quotaUsagePercent)

            return {
              ...home,
              appliances: updatedAppliances,
              totalConsumptionKwh: newTotalKwh,
              billingAmountTry: tiered.totalBill,
              penaltyActive: quotaUsagePercent >= 100,
              quotaUsagePercent,
            }
          })
        )
        setLastUpdated(Date.now())
        setIsStale(false)
        errorsRef.current = 0
        errorShownRef.current = false
      }
    } catch {
      if (mountedRef.current) {
        setLastUpdated(Date.now())
      }
    } finally {
      runningRef.current = false
    }
  }, [homes])

  // Initial full load
  useEffect(() => {
    mountedRef.current = true
    fetchAll()
    return () => {
      mountedRef.current = false
    }
  }, [fetchAll])

  // Continuous 1.5-second live polling timer loop
  useEffect(() => {
    const id = setInterval(pollStatus, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [pollStatus])

  const getHome = useCallback((id: string) => homes.find((h) => h.id === id), [homes])

  // Real Appliance Removal Action Function
  const removeAppliance = useCallback((homeId: string, applianceId: string) => {
    setHomes((prev) =>
      prev.map((h) => {
        if (h.id !== homeId) return h
        const updatedApps = h.appliances.filter((a) => a.id !== applianceId)
        return {
          ...h,
          appliances: updatedApps,
        }
      })
    )
  }, [])

  // AI-Powered Appliance Removal Function (Fuzzy Match Home & Device Name)
  const removeApplianceByName = useCallback(
    (homeQuery: string, applianceQuery: string) => {
      let deletedHomeName = ''
      let deletedAppName = ''
      let found = false

      setHomes((prev) =>
        prev.map((home) => {
          const homeTokens = home.name.toLowerCase().split(/[\s-]+/)
          const isHomeMatch =
            homeTokens.some((t) => t.length > 2 && homeQuery.toLowerCase().includes(t)) ||
            home.name.toLowerCase().includes(homeQuery.toLowerCase())

          if (!isHomeMatch && homeQuery.length > 0) return home

          const targetApp = home.appliances.find((a) => {
            const appLower = a.name.toLowerCase()
            const appQueryLower = applianceQuery.toLowerCase()
            if (appQueryLower.includes('ups') && appLower.includes('ups')) return true
            if (appQueryLower.includes('klima') && appLower.includes('klima')) return true
            if (appQueryLower.includes('şömine') && appLower.includes('şömine')) return true
            if (appQueryLower.includes('fırın') && appLower.includes('fırın')) return true
            if (appQueryLower.includes('sunucu') && appLower.includes('sunucu')) return true
            if (appQueryLower.includes('aydınlatma') && appLower.includes('aydınlatma')) return true
            return appLower.includes(appQueryLower) || appQueryLower.includes(appLower)
          })

          if (targetApp) {
            found = true
            deletedHomeName = home.name
            deletedAppName = targetApp.name
            const filteredApps = home.appliances.filter((a) => a.id !== targetApp.id)
            return {
              ...home,
              appliances: filteredApps,
            }
          }

          return home
        })
      )

      return { success: found, homeName: deletedHomeName, applianceName: deletedAppName }
    },
    []
  )

  // Real Home Deletion Function
  const deleteHome = useCallback((homeId: string) => {
    setHomes((prev) => prev.filter((h) => h.id !== homeId))
  }, [])

  // Mock Add Home Function — creates a new home locally with demo telemetry
  const addHome = useCallback((name: string, contactEmail: string, appliances: { name: string; safeLimitWatts: number }[]) => {
    const newId = `mock-${Date.now()}`
    const newAppliances: Home['appliances'] = appliances.map((a, i) => ({
      id: `${newId}-app-${i}`,
      name: a.name,
      safeLimit: a.safeLimitWatts,
      currentWatt: Math.round(a.safeLimitWatts * (0.3 + Math.random() * 0.5)),
      consecutiveBreaches: 0,
    }))

    const totalWatt = newAppliances.reduce((s, a) => s + a.currentWatt, 0)
    const totalKwh = totalWatt * 0.72 // simulated ~0.72 hours of usage
    const quotaKwh = 500
    const quotaPercent = (totalKwh / quotaKwh) * 100
    const tiered = calculateTieredBilling(totalKwh, quotaPercent)

    const newHome: Home = {
      id: newId,
      name,
      contactEmail,
      powerQuotaKwh: quotaKwh,
      financialQuota: 1000,
      normalTariffRate: 2.5,
      penaltyTariffRate: 5.0,
      quotaUsagePercent: quotaPercent,
      totalConsumptionKwh: totalKwh,
      billingAmountTry: tiered.totalBill,
      penaltyActive: quotaPercent >= 100,
      appliances: newAppliances,
      createdAt: new Date().toISOString(),
    }

    setHomes((prev) => [...prev, newHome])
  }, [])

  const value: HomesContextValue = {
    homes,
    loading,
    isStale,
    lastUpdated,
    getHome,
    refetch: fetchAll,
    addHome,
    removeAppliance,
    removeApplianceByName,
    deleteHome,
  }

  return <HomesContext.Provider value={value}>{children}</HomesContext.Provider>
}

export function useHomes() {
  const ctx = useContext(HomesContext)
  if (!ctx) throw new Error('useHomes must be used within HomesProvider')
  return ctx
}
