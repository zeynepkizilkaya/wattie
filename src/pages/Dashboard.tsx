import { useCallback, useMemo, useRef, useState } from 'react'
import { LayoutGrid, List, ArrowUp, ArrowDown } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { SummaryBar } from '@/components/SummaryBar'
import { LiveIndicator } from '@/components/LiveIndicator'
import { DashboardGrid, type ViewMode } from '@/components/DashboardGrid'
import { AddHomeModal } from '@/components/AddHomeModal'
import { HomeDetailModal } from '@/components/HomeDetailModal'
import { usePolling } from '@/hooks/usePolling'
import { useToast } from '@/hooks/useToast'
import { api } from '@/services/api'
import { type Home } from '@/types/home'
import { getHealthScore } from '@/utils/healthScore'
import { PageTransition } from '@/components/PageTransition'
import styles from './Dashboard.module.css'

type SortKey = 'risk' | 'quota' | 'consumption' | 'billing'
type SortDir = 'desc' | 'asc'
type FilterKey = 'breach' | 'anomaly'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'risk', label: 'Risk Skoru' },
  { key: 'quota', label: 'Kota' },
  { key: 'consumption', label: 'Tüketim' },
  { key: 'billing', label: 'Fatura' },
]

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'breach', label: 'Aşımda' },
  { key: 'anomaly', label: 'Anomalili' },
]

function sortHomes(homes: Home[], key: SortKey, dir: SortDir): Home[] {
  const sorted = [...homes]
  const mul = dir === 'desc' ? 1 : -1
  switch (key) {
    case 'risk':
      return sorted.sort((a, b) => mul * (getHealthScore(a) - getHealthScore(b)))
    case 'quota':
      return sorted.sort((a, b) => mul * (b.quotaUsagePercent - a.quotaUsagePercent))
    case 'consumption':
      return sorted.sort((a, b) => mul * (b.totalConsumptionKwh - a.totalConsumptionKwh))
    case 'billing':
      return sorted.sort((a, b) => mul * (b.billingAmountTry - a.billingAmountTry))
  }
}

function filterHomes(homes: Home[], filters: Set<FilterKey>): Home[] {
  if (filters.size === 0) return homes
  return homes.filter((home) => {
    if (filters.has('breach') && home.quotaUsagePercent < 100) return false
    if (filters.has('anomaly') && !home.appliances.some((a) => a.consecutiveBreaches >= 3)) return false
    return true
  })
}

export function Dashboard() {
  const { addToast } = useToast()
  const [homes, setHomes] = useState<Home[]>([])
  const [loading, setLoading] = useState(true)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('risk')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set())
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [, setTotalElements] = useState(0)
  const [selectedHome, setSelectedHome] = useState<Home | null>(null)
  const errorShown = useRef(false)

  const fetchHomes = useCallback(async () => {
    try {
      const data = await api.getHomes(page)
      setHomes(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
      setLastUpdated(Date.now())
      errorShown.current = false
    } catch {
      if (!errorShown.current) {
        errorShown.current = true
        addToast('Veriler yüklenirken bir hata oluştu.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }, [addToast, page])

  const pollingState = usePolling(fetchHomes, 2000)

  const toggleFilter = (key: FilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
    setPage(0)
  }

  const sortedHomes = useMemo(() => {
    const filtered = filterHomes(homes, activeFilters)
    return sortHomes(filtered, sortKey, sortDir)
  }, [homes, sortKey, sortDir, activeFilters])

  const handleHomeClick = (home: Home) => {
    setSelectedHome(home)
  }

  return (
    <>
      <TopNav onAddHome={() => setAddModalOpen(true)} />

      <div className={styles.page}>
        <PageTransition>
          <header className={styles.header}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Enerji İzleme Merkezi</h1>
              <LiveIndicator lastUpdated={lastUpdated} />
            </div>
            <p className={styles.subtitle}>
              Kayıtlı konutların anlık tüketim ve kota durumu
            </p>
          </header>
        </PageTransition>

        {pollingState.isStale && (
          <div className={styles.staleBanner}>
            Bağlantı kesildi — son bilinen veriler gösteriliyor.
          </div>
        )}

        <PageTransition delay={1}>
          {homes.length > 0 && <SummaryBar homes={homes} />}
        </PageTransition>

        <main className={styles.main}>
          {homes.length > 1 && (
            <div className={styles.toolbar}>
              <div className={styles.toolbarLeft}>
                <div className={styles.sortBar}>
                  <span className={styles.sortLabel}>Sırala:</span>
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      className={`${styles.sortBtn} ${sortKey === opt.key ? styles.sortBtnActive : ''}`}
                      onClick={() => setSortKey(opt.key)}
                    >
                      {opt.label}
                    </button>
                  ))}
                  <button
                    className={styles.dirBtn}
                    onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
                    aria-label={sortDir === 'desc' ? 'Azalan sırada' : 'Artan sırada'}
                    title={sortDir === 'desc' ? 'Azalan' : 'Artan'}
                  >
                    {sortDir === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                  </button>
                </div>
                <div className={styles.filterBar}>
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      className={`${styles.filterBtn} ${activeFilters.has(opt.key) ? styles.filterBtnActive : ''}`}
                      onClick={() => toggleFilter(opt.key)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.viewToggle}>
                <button
                  className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid görünümü"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="Liste görünümü"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          )}
          <DashboardGrid
            homes={sortedHomes}
            loading={loading}
            onHomeClick={handleHomeClick}
            viewMode={viewMode}
          />
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                Önceki
              </button>
              <span className={styles.pageInfo}>
                {page + 1} / {totalPages}
              </span>
              <button
                className={styles.pageBtn}
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Sonraki
              </button>
            </div>
          )}
        </main>
      </div>

      <AddHomeModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      {selectedHome && (
        <HomeDetailModal
          homeId={selectedHome.id}
          initialHome={selectedHome}
          open={!!selectedHome}
          onClose={() => setSelectedHome(null)}
        />
      )}
    </>
  )
}
