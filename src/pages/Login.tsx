import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { api } from '@/services/api'
import styles from './Auth.module.css'

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { addToast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [exiting, setExiting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      addToast('Tüm alanları doldurun.', 'warning')
      return
    }

    setSubmitting(true)
    try {
      const res = await api.login({ email: email.trim(), password })
      login(res.token, res.user)
      setExiting(true)
      timerRef.current = setTimeout(() => navigate('/', { replace: true }), 400)
    } catch {
      addToast('Giriş başarısız. E-posta veya şifre hatalı.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`${styles.formSide} ${exiting ? styles.fadeOut : ''}`}>
      <div className={styles.card}>
        <div className={styles.brandRow}>
          <Zap size={22} className={styles.brandIcon} />
          <h1 className={styles.title}>Wattie</h1>
        </div>
        <p className={styles.subtitle}>Hesabınıza giriş yapın</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">E-posta</label>
            <input
              id="email"
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Şifre</label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 6 karakter"
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p className={styles.footer}>
          Hesabınız yok mu? <Link to="/signup" className={styles.link}>Kayıt Ol</Link>
        </p>
      </div>
    </div>
  )
}
