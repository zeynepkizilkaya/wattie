import { useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { api } from '@/services/api'
import styles from './AddApplianceForm.module.css'

interface AddApplianceFormProps {
  homeId: string
}

export function AddApplianceForm({ homeId }: AddApplianceFormProps) {
  const { addToast } = useToast()
  const [name, setName] = useState('')
  const [limit, setLimit] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const safeLimit = Number(limit)
    if (!name.trim() || !limit.trim()) {
      addToast('Cihaz adı ve limit zorunludur.', 'warning')
      return
    }
    if (!Number.isFinite(safeLimit) || safeLimit <= 0) {
      addToast('Limit sıfırdan büyük bir sayı olmalıdır.', 'warning')
      return
    }

    setSubmitting(true)
    try {
      await api.addAppliance(homeId, {
        name: name.trim(),
        safeLimit,
      })
      addToast('Cihaz başarıyla eklendi.', 'success')
      setName('')
      setLimit('')
    } catch {
      addToast('Cihaz eklenirken bir hata oluştu.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        className={styles.input}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Yeni cihaz adı"
      />
      <input
        className={styles.inputSmall}
        type="number"
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
        placeholder="Limit (W)"
        min="0"
      />
      <button type="submit" className={styles.submitBtn} disabled={submitting}>
        {submitting ? '...' : '+ Ekle'}
      </button>
    </form>
  )
}
