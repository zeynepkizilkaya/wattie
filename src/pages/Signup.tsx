import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useToast } from '@/hooks/useToast'
import styles from './Auth.module.css'

export function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { addToast } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [exiting, setExiting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !password.trim()) {
      addToast('Tüm alanları doldurun.', 'warning')
      return
    }

    if (password.length < 6) {
      addToast('Şifre en az 6 karakter olmalıdır.', 'warning')
      return
    }

    if (password !== confirmPassword) {
      addToast('Şifreler eşleşmiyor.', 'warning')
      return
    }

    setSubmitting(true)
    try {
      login('demo-token-' + Date.now(), {
        id: '1',
        name: name.trim(),
        email: email.trim(),
      })
      addToast('Kayıt başarıyla oluşturuldu.', 'success')
      setExiting(true)
      timerRef.current = setTimeout(() => navigate('/dashboard', { replace: true }), 400)
    } catch {
      addToast('Kayıt başarısız. Lütfen tekrar deneyin.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`${styles.formSide} ${exiting ? styles.fadeOut : ''}`}>
      {/* AMBIENT GLOWING ORBS & ANIMATED TECH BACKGROUND */}
      <div className={styles.bgWrapper} aria-hidden="true">
        <div className={styles.glowOrb1} />
        <div className={styles.glowOrb2} />
        <div className={styles.glowOrb3} />
        <div className={styles.glowOrb4} />
        <div className={styles.glowOrb5} />
        <div className={styles.glowOrb6} />
        <div className={styles.cyberGrid} />

        {/* Multi-Directional Cyber Laser Beams */}
        <div className={styles.laserVert1} />
        <div className={styles.laserVert2} />
        <div className={styles.laserVert3} />
        <div className={styles.laserHoriz1} />
        <div className={styles.laserHoriz2} />
        <div className={styles.laserHoriz3} />
        <div className={styles.laserDiag1} />
        <div className={styles.laserDiag2} />
      </div>

      <button
        type="button"
        className={styles.themeToggle}
        onClick={toggleTheme}
        aria-label={theme === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç'}
        title={theme === 'light' ? 'Koyu Temaya Geç' : 'Açık Temaya Geç'}
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <div className={styles.card}>
        <div className={styles.brandRow}>
          <Zap size={22} className={styles.brandIcon} />
          <h1 className={styles.title}>Wattie</h1>
        </div>
        <p className={styles.subtitle}>Yeni hesap oluşturun</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">Ad Soyad</label>
            <input
              id="name"
              className={styles.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adınız ve soyadınız"
              autoComplete="name"
            />
          </div>

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
                autoComplete="new-password"
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

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirm-password">Şifre Tekrar</label>
            <div className={styles.inputWrapper}>
              <input
                id="confirm-password"
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Şifrenizi tekrar girin"
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p className={styles.footer}>
          Zaten hesabınız var mı? <Link to="/login" className={styles.link}>Giriş Yap</Link>
        </p>
      </div>

      {/* TEAM FOOTER WITH LINKEDIN REDIRECTIONS */}
      <footer className={styles.teamFooter}>
        <p className={styles.poweredByText}>
          Powered by{' '}
          <a
            href="https://www.linkedin.com/in/efekoc/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.teamLink}
          >
            Efe Koç
          </a>{' '}
          <a
            href="https://www.linkedin.com/in/zeynep-kizilkaya/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.teamLink}
          >
            Zeynep Kızılkaya
          </a>{' '}
          <a
            href="https://www.linkedin.com/in/zeynep-s%C4%B1la-d-863872252/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.teamLink}
          >
            Zeynep Sıla Durak
          </a>
        </p>
        <span className={styles.projectSubText}>i2i Academy Wattie Project</span>
      </footer>
    </div>
  )
}
