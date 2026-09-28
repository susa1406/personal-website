import { useState } from 'react'
import { Eye, EyeOff, Zap, AlertCircle, UserPlus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Email and password are required.')
      return
    }
    setLoading(true)
    try {
      await signIn(email.trim(), password)
      toast.success('Welcome back!')
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const mailtoUrl = "mailto:susaprogramer@gmail.com?subject=New%20Account%20Request&body=Hi%20Susa%2C%20I%20would%20like%20to%20create%20a%20new%20account.%20Please%20provide%20me%20with%20the%20registration%20user%20ID%20and%20password%20to%20get%20started."

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-icon">
            <Zap size={32} color="#fff" />
          </div>
          <div className="login-title">JARVIS</div>
          <div className="login-subtitle">Personal Tracker</div>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 6,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--error)',
              fontSize: 13,
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Password</label>
            <div className="password-wrapper">
              <input
                type={showPwd ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPwd(v => !v)}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                AUTHENTICATING...
              </span>
            ) : 'LOGIN'}
          </button>
        </form>

        <div className="login-request-box">
          <span className="login-request-label">New user?</span>
          <a
            href={mailtoUrl}
            className="login-request-link"
          >
            <UserPlus size={14} />
            Request for new account
          </a>
        </div>

        <div className="login-status">
          <div>🔴 SYSTEM ONLINE</div>
          <div style={{ marginTop: 4 }}>SECURE CONNECTION ESTABLISHED</div>
        </div>
      </div>
    </div>
  )
}
