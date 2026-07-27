import { useEffect, useRef, useState, lazy, Suspense, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box } from 'lucide-react'
import { api } from '@/services/api'
import { type Home, type DailyConsumption, type Recommendation } from '@/types/home'
import { generateHistory } from '@/mocks/data'
import { useHomes } from '@/hooks/useHomes'
import { useToast } from '@/hooks/useToast'
import { getQuotaState } from '@/utils/quota'
import { AddApplianceForm } from './AddApplianceForm'
import { AnomalyTimeline } from './AnomalyTimeline'
import { ApplianceGrid } from './ApplianceGrid'
import { BillingSection } from './BillingSection'
import { ConfirmDialog } from './ConfirmDialog'
import { DeviceComparisonChart } from './DeviceComparisonChart'
import { LiveIndicator } from './LiveIndicator'
import { QuotaProgressBar } from './QuotaProgressBar'
import { QuotaTrendProjection } from './QuotaTrendProjection'
import styles from './HomeDetailModal.module.css'

const ConsumptionChart = lazy(() =>
  import('./ConsumptionChart').then(m => ({ default: m.ConsumptionChart }))
)
const AppliancePieChart = lazy(() =>
  import('./AppliancePieChart').then(m => ({ default: m.AppliancePieChart }))
)
const ApplianceBarChart = lazy(() =>
  import('./ApplianceBarChart').then(m => ({ default: m.ApplianceBarChart }))
)
const CostBreakdownChart = lazy(() =>
  import('./CostBreakdownChart').then(m => ({ default: m.CostBreakdownChart }))
)
const HourlyConsumptionChart = lazy(() =>
  import('./HourlyConsumptionChart').then(m => ({ default: m.HourlyConsumptionChart }))
)

interface HomeDetailModalProps {
  homeId: string
  initialHome?: Home
  open: boolean
  onClose: () => void
}

export function HomeDetailModal({ homeId, initialHome, open, onClose }: HomeDetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const navigate = useNavigate()
  const { addToast } = useToast()
  const { getHome, lastUpdated } = useHomes()

  const home = getHome(homeId) ?? initialHome ?? null
  const [history, setHistory] = useState<DailyConsumption[]>([])
  const [hourlyData, setHourlyData] = useState<Array<{ hour: number; consumptionWh: number }>>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  useEffect(() => {
    setHistory([])
    setHourlyData([])
    setRecommendations([])
  }, [homeId])

  // Dialog open/close management
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleClose = () => onCloseRef.current()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [])

  // Fetch history once on mount (when open)
  useEffect(() => {
    if (!open) return

    api.getHomeTrend(homeId).then(data => {
      if (data && data.length > 0) {
        setHistory(data)
        setHourlyData(data.map((d, i) => ({ hour: i, consumptionWh: d.totalKwh * 1000 })))
      } else {
        const mockHist = generateHistory(homeId)
        setHistory(mockHist.map(h => ({ date: h.date || '', totalKwh: h.consumptionKwh, totalCost: h.consumptionKwh * 2.45 })))
        setHourlyData(mockHist.map((h, i) => ({ hour: i, consumptionWh: h.consumptionKwh * 100 })))
      }
    }).catch(() => {
      const mockHist = generateHistory(homeId)
      setHistory(mockHist.map(h => ({ date: h.date || '', totalKwh: h.consumptionKwh, totalCost: h.consumptionKwh * 2.45 })))
      setHourlyData(mockHist.map((h, i) => ({ hour: i, consumptionWh: h.consumptionKwh * 100 })))
    })
  }, [homeId, open])

  // Fetch recommendations once on mount (when open)
  useEffect(() => {
    if (!open) return

    api.getHomeEvents(homeId).then(events => {
      setRecommendations(events
        .filter(e => e.aiRecommendation)
        .map(e => ({
          id: e.id,
          homeId,
          type: 'general' as const,
          title: e.eventType,
          message: e.aiRecommendation || e.details,
          createdAt: e.createdAt,
        }))
      )
    }).catch(() => {})
  }, [homeId, open, addToast])


  // Delete home
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { removeAppliance, deleteHome } = useHomes()

  const handleDeleteHome = async () => {
    if (home) {
      deleteHome(home.id)
      addToast(`"${home.name}" konuta başarıyla silindi.`, 'success')
    }
    setConfirmDelete(false)
    onClose()
  }

  // Remove appliance handler
  const [pendingRemoveAppliance, setPendingRemoveAppliance] = useState<string | null>(null)

  const handleRemoveAppliance = useCallback((applianceId: string) => {
    setPendingRemoveAppliance(applianceId)
  }, [])

  const confirmRemoveAppliance = useCallback(async () => {
    if (!pendingRemoveAppliance || !home) return
    const appName = home.appliances.find(a => a.id === pendingRemoveAppliance)?.name || 'Cihaz'
    removeAppliance(home.id, pendingRemoveAppliance)
    addToast(`"${appName}" cihazı başarıyla kaldırıldı.`, 'success')
    setPendingRemoveAppliance(null)
  }, [pendingRemoveAppliance, home, removeAppliance, addToast])

  const handleUpdateLimit = useCallback(async (_applianceId: string, _newLimit: number) => {
    addToast('Limit güncelleme özelliği henüz desteklenmiyor.', 'error')
  }, [addToast])

  // Backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  const quotaState = home ? getQuotaState(home.quotaUsagePercent) : 'normal'

  const badgeLabel = quotaState === 'breach'
    ? 'Kota Aşımı'
    : quotaState === 'warning'
      ? 'Uyarı'
      : 'Normal'

  const badgeClass = quotaState === 'breach'
    ? `${styles.badge} ${styles.breach}`
    : quotaState === 'warning'
      ? `${styles.badge} ${styles.warning}`
      : styles.badge

  return (
    <>
    <dialog ref={dialogRef} className={styles.dialog} onClick={handleBackdropClick} aria-labelledby="home-detail-title">
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 id="home-detail-title" className={styles.title}>{home?.name ?? 'Yükleniyor...'}</h2>
            {home && <span className={badgeClass}>{badgeLabel}</span>}
            <LiveIndicator lastUpdated={lastUpdated} />
          </div>
          <div className={styles.headerActions}>
            {(home?.id === 'h1' || home?.name?.includes('Kadıköy')) && (
              <button
                className={styles.view3dBtnModal}
                onClick={() => {
                  navigate(`/house?homeId=${homeId}`)
                  onClose()
                }}
              >
                <Box size={14} />
                <span>3D Dijital İkizinde Gör</span>
              </button>
            )}
            <button className={styles.deleteBtn} onClick={() => setConfirmDelete(true)}>
              Konutu Sil
            </button>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Kapat">
            ✕
          </button>
        </header>

        <div className={styles.body}>
          {!home ? (
            <div className={styles.skeleton} />
          ) : (
            <>
              {/* Stats row */}
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Kota</span>
                  <span className={`${styles.statValue} ${quotaState === 'breach' ? styles.text_breach : quotaState === 'warning' ? styles.text_warning : ''}`}>
                    %{home.quotaUsagePercent.toFixed(1)}
                  </span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Tüketim</span>
                  <span className={styles.statValue}>{home.totalConsumptionKwh.toFixed(2)} kWh</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Fatura</span>
                  <span className={styles.statValue}>{home.billingAmountTry.toFixed(2)} ₺</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Tarife</span>
                  <span className={`${styles.statValue} ${home.penaltyActive ? styles.text_breach : ''}`}>
                    {home.penaltyActive ? 'Ceza' : 'Normal'}
                  </span>
                </div>
              </div>

              {/* Threshold warnings & trend projection side by side */}
              <div className={styles.thresholdContainer}>
                {home.quotaUsagePercent >= 100 && (
                  <div className={styles.thresholdBanner} data-severity="error">
                    <span className={styles.thresholdIcon}>⚠</span>
                    <div className={styles.thresholdContent}>
                      <strong>Kota limiti aşıldı</strong>
                      <span>Ceza tarifesi uygulanıyor. Tüketimi azaltmanız önerilir.</span>
                    </div>
                  </div>
                )}
                {home.quotaUsagePercent >= 80 && home.quotaUsagePercent < 100 && (
                  <div className={styles.thresholdBanner} data-severity="warning">
                    <span className={styles.thresholdIcon}>⚠</span>
                    <div className={styles.thresholdContent}>
                      <strong>Kota uyarısı — %80 aşıldı</strong>
                      <span>Kullanımınız kota limitine yaklaşıyor.</span>
                    </div>
                  </div>
                )}

                {/* Quota trend projection */}
                <QuotaTrendProjection home={home} />
              </div>

              {/* Quota progress bar */}
              <div className={styles.section}>
                <QuotaProgressBar quotaPercent={home.quotaUsagePercent} />
              </div>

              {/* Appliance grid */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Cihazlar</h3>
                <ApplianceGrid
                  appliances={home.appliances}
                  quotaPercent={home.quotaUsagePercent}
                  onRemove={handleRemoveAppliance}
                  onUpdateLimit={handleUpdateLimit}
                />
                <AddApplianceForm homeId={home.id} />
              </section>

              {/* Anomaly timeline */}
              {home.appliances.some(a => a.consecutiveBreaches > 0) && (
                <section className={styles.section}>
                  <AnomalyTimeline appliances={home.appliances} />
                </section>
              )}

              {/* Device comparison */}
              <section className={styles.section}>
                <DeviceComparisonChart appliances={home.appliances} />
              </section>

              {/* Appliance bar chart (lazy) */}
              <section className={styles.section}>
                <Suspense fallback={<div className={styles.chartSkeleton} />}>
                  <ApplianceBarChart appliances={home.appliances} />
                </Suspense>
              </section>

              {/* Pie charts row */}
              <div className={styles.chartGrid}>
                <section className={styles.section}>
                  <Suspense fallback={<div className={styles.chartSkeleton} />}>
                    <AppliancePieChart appliances={home.appliances} />
                  </Suspense>
                </section>
                {home.penaltyActive && (
                  <section className={styles.section}>
                    <Suspense fallback={<div className={styles.chartSkeleton} />}>
                      <CostBreakdownChart home={home} />
                    </Suspense>
                  </section>
                )}
              </div>

              {/* Consumption chart (lazy) */}
              <section className={styles.section}>
                <Suspense fallback={<div className={styles.chartSkeleton} />}>
                  <ConsumptionChart data={history} />
                </Suspense>
              </section>

              {/* Hourly consumption chart (lazy) */}
              <section className={styles.section}>
                <Suspense fallback={<div className={styles.chartSkeleton} />}>
                  <HourlyConsumptionChart data={hourlyData} />
                </Suspense>
              </section>

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>AI Önerileri</h3>
                  <div className={styles.recommendations}>
                    {recommendations.map(rec => (
                      <div key={rec.id} className={`${styles.recCard} ${styles[`rec_${rec.type}`]}`}>
                        <span className={styles.recTitle}>{rec.title}</span>
                        <p className={styles.recMessage}>{rec.message}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Billing */}
              <BillingSection home={home} />
            </>
          )}
        </div>
      </div>
    </dialog>
    <ConfirmDialog
      open={confirmDelete}
      title="Konutu Sil"
      message={`"${home?.name ?? ''}" konutunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
      confirmLabel="Evet, Sil"
      onConfirm={handleDeleteHome}
      onCancel={() => setConfirmDelete(false)}
    />
    <ConfirmDialog
      open={pendingRemoveAppliance !== null}
      title="Cihazı Kaldır"
      message={`"${home?.appliances.find(a => a.id === pendingRemoveAppliance)?.name ?? ''}" cihazını kaldırmak istediğinize emin misiniz?`}
      confirmLabel="Evet, Kaldır"
      onConfirm={confirmRemoveAppliance}
      onCancel={() => setPendingRemoveAppliance(null)}
    />
  </>
  )
}
