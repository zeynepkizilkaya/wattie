import { useCallback, useState } from 'react'
import { Modal } from './Modal'
import { useToast } from '@/hooks/useToast'
import { api } from '@/services/api'
import styles from './AddHomeModal.module.css'

interface ApplianceInput {
  key: number
  name: string
  safeLimit: string
}

interface AddHomeModalProps {
  open: boolean
  onClose: () => void
}

const APPLIANCE_PRESETS = [
  { name: 'Buzdolabı', safeLimit: 200, category: 'Mutfak' },
  { name: 'Çamaşır Makinesi', safeLimit: 600, category: 'Mutfak' },
  { name: 'Bulaşık Makinesi', safeLimit: 500, category: 'Mutfak' },
  { name: 'Elektrikli Fırın', safeLimit: 2000, category: 'Mutfak' },
  { name: 'Mikrodalga', safeLimit: 800, category: 'Mutfak' },
  { name: 'Kettle', safeLimit: 1500, category: 'Mutfak' },
  { name: 'Klima', safeLimit: 1500, category: 'Isıtma/Soğutma' },
  { name: 'Isı Pompası', safeLimit: 2500, category: 'Isıtma/Soğutma' },
  { name: 'Şofben', safeLimit: 2000, category: 'Isıtma/Soğutma' },
  { name: 'Elektrikli Şömine', safeLimit: 1800, category: 'Isıtma/Soğutma' },
  { name: 'Televizyon', safeLimit: 200, category: 'Elektronik' },
  { name: 'Bilgisayar', safeLimit: 400, category: 'Elektronik' },
  { name: 'Kurutma Makinesi', safeLimit: 2500, category: 'Diğer' },
  { name: 'Elektrikli Araç Şarjı', safeLimit: 7500, category: 'Diğer' },
  { name: 'Havuz Motoru', safeLimit: 800, category: 'Diğer' },
] as const

const CATEGORIES = [...new Set(APPLIANCE_PRESETS.map((p) => p.category))]

let applianceKey = 0

function createEmptyAppliance(): ApplianceInput {
  return { key: applianceKey++, name: '', safeLimit: '' }
}

export function AddHomeModal({ open, onClose }: AddHomeModalProps) {
  const { addToast } = useToast()
  const [homeName, setHomeName] = useState('')
  const [email, setEmail] = useState('')
  const [presetCounts, setPresetCounts] = useState<Record<string, number>>({})
  const [appliances, setAppliances] = useState<ApplianceInput[]>([createEmptyAppliance()])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addAppliance = () => {
    setAppliances((prev) => [...prev, createEmptyAppliance()])
  }

  const removeAppliance = (key: number) => {
    setAppliances((prev) => prev.filter((a) => a.key !== key))
  }

  const updateAppliance = (key: number, field: 'name' | 'safeLimit', value: string) => {
    setAppliances((prev) =>
      prev.map((a) => (a.key === key ? { ...a, [field]: value } : a))
    )
  }

  const togglePreset = (presetName: string) => {
    setPresetCounts((prev) => {
      const current = prev[presetName] || 0
      return { ...prev, [presetName]: current + 1 }
    })
  }

  const decrementPreset = (presetName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setPresetCounts((prev) => {
      const current = prev[presetName] || 0
      if (current <= 1) {
        const next = { ...prev }
        delete next[presetName]
        return next
      }
      return { ...prev, [presetName]: current - 1 }
    })
  }

  const resetForm = useCallback(() => {
    setHomeName('')
    setEmail('')
    setPresetCounts({})
    setAppliances([createEmptyAppliance()])
    setError(null)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!homeName.trim()) {
      setError('Konut adı zorunludur.')
      return
    }

    if (!email.trim()) {
      setError('E-posta adresi zorunludur.')
      return
    }

    // Build preset appliances from counts
    const presetAppliances: { name: string; safeLimit: number }[] = []
    for (const [presetName, count] of Object.entries(presetCounts)) {
      const preset = APPLIANCE_PRESETS.find((p) => p.name === presetName)
      if (preset) {
        for (let i = 0; i < count; i++) {
          presetAppliances.push({ name: preset.name, safeLimit: preset.safeLimit })
        }
      }
    }

    // Build manual appliances
    const validManualAppliances = appliances
      .filter((a) => a.name.trim() && a.safeLimit.trim())
      .map((a) => ({ name: a.name.trim(), safeLimit: Number(a.safeLimit) }))

    const allAppliances = [...presetAppliances, ...validManualAppliances]

    if (allAppliances.length === 0) {
      setError('En az bir cihaz ekleyip adını ve limitini doldurun.')
      return
    }

    setSubmitting(true)
    try {
      await api.createHome({
        name: homeName.trim(),
        email: email.trim(),
        appliances: allAppliances,
      })
      addToast('Konut başarıyla kaydedildi.', 'success')
      resetForm()
      onClose()
    } catch {
      setError('Konut kaydedilirken bir hata oluştu. Tekrar deneyin.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Yeni Konut Kaydet">
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.inlineError}>{error}</div>}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="home-name">Konut Adı</label>
          <input
            id="home-name"
            className={styles.input}
            type="text"
            value={homeName}
            onChange={(e) => setHomeName(e.target.value)}
            placeholder="Örn: Ev - Kadıköy"
          />
        </div>

        <div className={styles.emailField}>
          <label className={styles.label} htmlFor="home-email">E-posta</label>
          <input
            id="home-email"
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@mail.com"
          />
        </div>

        <div className={styles.presetsSection}>
          <span className={styles.presetsLabel}>Yaygın Cihazlar</span>
          {CATEGORIES.map((category) => (
            <div key={category} className={styles.categoryGroup}>
              <span className={styles.categoryName}>{category}</span>
              <div className={styles.presetGrid}>
                {APPLIANCE_PRESETS.filter((p) => p.category === category).map((preset) => {
                  const count = presetCounts[preset.name] || 0
                  const isActive = count > 0
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      className={`${styles.presetBtn} ${isActive ? styles.presetBtnActive : ''}`}
                      onClick={() => togglePreset(preset.name)}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        if (isActive) decrementPreset(preset.name, e)
                      }}
                    >
                      {preset.name}
                      {count > 1 && (
                        <span className={styles.presetCount}>{count}</span>
                      )}
                      {isActive && (
                        <span
                          onClick={(e) => decrementPreset(preset.name, e)}
                          style={{ cursor: 'pointer', marginLeft: 2 }}
                        >
                          ✕
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.manualSection}>
          <div className={styles.manualHeader}>
            <span className={styles.label}>Ek Cihazlar (Manuel)</span>
            <button type="button" className={styles.addBtn} onClick={addAppliance}>
              + Cihaz Ekle
            </button>
          </div>

          {appliances.map((appliance) => (
            <div key={appliance.key} className={styles.applianceRow}>
              <input
                className={styles.input}
                type="text"
                value={appliance.name}
                onChange={(e) => updateAppliance(appliance.key, 'name', e.target.value)}
                placeholder="Cihaz adı"
              />
              <input
                className={styles.inputSmall}
                type="number"
                value={appliance.safeLimit}
                onChange={(e) => updateAppliance(appliance.key, 'safeLimit', e.target.value)}
                placeholder="Limit (W)"
                min="0"
              />
              {appliances.length > 1 && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeAppliance(appliance.key)}
                  aria-label="Cihazı kaldır"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={handleClose}>
            İptal
          </button>
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
