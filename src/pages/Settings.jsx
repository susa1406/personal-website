import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { supabase } from '../lib/supabase'
import {
  User, Lock, LogOut, Download, Shield, Palette,
  HelpCircle, Mail, Bug, Lightbulb, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

const FAQS = [
  {
    q: 'How do I install JARVIS on my phone or computer?',
    a: [
      'Android (Chrome / Brave): Tap the browser menu (⋮ at the top right) and select "Add to Home Screen" or "Install App".',
      'Windows / PC: Click the install icon (⊕) on the right side of the browser address bar and click "Install".',
      'Once installed, JARVIS launches in fullscreen mode with its own custom red lightning icon, just like a native mobile app.'
    ]
  },
  {
    q: 'How does the floating Quick Add (+) button work?',
    a: [
      'Tap to Open: Opens the fan-out menu to instantly log Money, Expense, Experience, or Note without leaving your current page.',
      'Hold & Drag: Press and hold the red + button to drag it anywhere across your screen so it never covers what you are reading.',
      'Position Memory: The app automatically remembers where you placed the button even after closing or refreshing.'
    ]
  },
  {
    q: 'How do I back up all my data?',
    a: [
      'Scroll to the Data section in Settings and tap "Export Personal Data".',
      'A complete JSON file containing your money records, expenses, goals, notes, and experiences will be safely downloaded to your device.'
    ]
  },
  {
    q: 'Is my personal and financial data private?',
    a: [
      'Yes, 100% private. Your database is secured with PostgreSQL Row Level Security (RLS).',
      'Each entry is cryptographically tied to your personal account ID. No other user or outside party has permission to read or modify your data.'
    ]
  },
  {
    q: 'Does JARVIS work offline without internet?',
    a: [
      'Yes, the application shell, pages, and cached dashboard load offline via Progressive Web App (PWA) service workers.',
      'Saving new transactions or synchronizing data with the cloud database requires an active internet connection.'
    ]
  }
]

export default function Settings() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const [name, setName] = useState(profile?.name || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [savingPwd, setSavingPwd] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState(null)

  function toggleFaq(index) {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  function handleClearCache() {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name))
      })
    }
    toast.success('App cache cleared! Reloading...')
    setTimeout(() => {
      window.location.reload()
    }, 800)
  }


  async function handleSaveProfile(e) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Name cannot be empty'); return }
    setSavingProfile(true)
    try {
      await updateProfile({ name: name.trim(), email: user.email })
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setSavingPwd(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Password updated!')
      setOldPassword('')
      setNewPassword('')
    } catch (err) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setSavingPwd(false)
    }
  }

  async function handleExport() {
    try {
      const [expenses, money, experiences, goals, notes] = await Promise.all([
        supabase.from('expenses').select('*').eq('user_id', user.id),
        supabase.from('money_received').select('*').eq('user_id', user.id),
        supabase.from('experiences').select('*').eq('user_id', user.id),
        supabase.from('goals').select('*').eq('user_id', user.id),
        supabase.from('notes').select('*').eq('user_id', user.id),
      ])
      const data = {
        exported_at: new Date().toISOString(),
        user_email: user.email,
        expenses: expenses.data,
        money_received: money.data,
        experiences: experiences.data,
        goals: goals.data,
        notes: notes.data,
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `jarvis-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Data exported!')
    } catch {
      toast.error('Export failed')
    }
  }

  async function handleLogout() {
    try {
      await signOut()
      toast.success('Logged out')
    } catch (err) {
      toast.error('Logout failed')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Settings</div>
        <div className="page-subtitle">Manage your profile and account</div>
      </div>

      {/* Profile */}
      <div className="settings-section">
        <div className="settings-section-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><User size={14} /> Profile</div>
        </div>
        <form onSubmit={handleSaveProfile}>
          <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff' }}>
                {(profile?.name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{profile?.name || 'Personal Account'}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
            </div>
            <div style={{ width: '100%' }}>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Display Name</label>
                <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Susa Sir" />
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
                <div className="form-hint">Email cannot be changed here</div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                {savingProfile ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Security */}
      <div className="settings-section">
        <div className="settings-section-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={14} /> Security</div>
        </div>
        <form onSubmit={handleChangePassword}>
          <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: '100%' }}>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" />
              </div>
              <button type="submit" className="btn btn-secondary" disabled={savingPwd || !newPassword}>
                {savingPwd ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Change Password'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Appearance */}
      <div className="settings-section">
        <div className="settings-section-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Palette size={14} /> Appearance</div>
        </div>
        <div className="theme-toggle-row">
          <div>
            <div className="settings-row-label">Theme</div>
            <div className="settings-row-sub">
              {isDark ? '🌙 Dark mode — JARVIS classic' : '☀️ Light mode — clean & bright'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="theme-mode-labels">
              <span className="theme-icon">☀️</span>
              <span style={{ fontSize: 11, color: !isDark ? 'var(--accent-red)' : 'var(--text-muted)', fontWeight: !isDark ? 700 : 400 }}>Light</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={isDark} onChange={toggleTheme} />
              <div className="toggle-track">
                <div className="toggle-thumb" />
              </div>
            </label>
            <div className="theme-mode-labels">
              <span style={{ fontSize: 11, color: isDark ? 'var(--accent-red)' : 'var(--text-muted)', fontWeight: isDark ? 700 : 400 }}>Dark</span>
              <span className="theme-icon">🌙</span>
            </div>
          </div>
        </div>
      </div>


      {/* Data */}
      <div className="settings-section">
        <div className="settings-section-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Download size={14} /> Data</div>
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Export Personal Data</div>
            <div className="settings-row-sub">Download all your data as JSON</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleExport}>
            <Download size={14} /> Export Data
          </button>
        </div>
      </div>

      {/* Help & Support */}
      <div className="settings-section">
        <div className="settings-section-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HelpCircle size={14} /> Help & Support
          </div>
        </div>

        {/* Quick Contact Action Buttons */}
        <div className="support-quick-actions">
          <a
            href="mailto:susaprogramer@gmail.com?subject=JARVIS%20Support%20Request&body=Hi%20Susa%2C%20I%20need%20assistance%20with%20JARVIS%3A%0A%0A"
            className="support-action-card"
          >
            <div className="support-action-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
              <Mail size={18} />
            </div>
            <div className="support-action-text">
              <div className="support-action-title">Contact Support</div>
              <div className="support-action-desc">Email Susa directly</div>
            </div>
          </a>

          <a
            href="mailto:susaprogramer@gmail.com?subject=JARVIS%20Bug%20Report&body=Hi%20Susa%2C%20I%20found%20a%20bug%3A%0A%0AProblem%20Description%3A%0A-%20%0ASteps%20to%20Reproduce%3A%0A-%20%0ADevice%20%2F%20Browser%3A%20"
            className="support-action-card"
          >
            <div className="support-action-icon" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--accent-red)' }}>
              <Bug size={18} />
            </div>
            <div className="support-action-text">
              <div className="support-action-title">Report a Bug</div>
              <div className="support-action-desc">Found an issue or glitch?</div>
            </div>
          </a>

          <a
            href="mailto:susaprogramer@gmail.com?subject=JARVIS%20Feature%20Suggestion&body=Hi%20Susa%2C%20I%20have%20a%20suggestion%20for%20a%20new%20feature%3A%0A%0A"
            className="support-action-card"
          >
            <div className="support-action-icon" style={{ background: 'rgba(212,160,23,0.15)', color: 'var(--accent-gold)' }}>
              <Lightbulb size={18} />
            </div>
            <div className="support-action-text">
              <div className="support-action-title">Suggest Feature</div>
              <div className="support-action-desc">Request new capability</div>
            </div>
          </a>
        </div>

        {/* FAQs Accordion */}
        <div className="support-faq-wrapper">
          <div className="support-faq-header">Frequently Asked Questions</div>
          <div className="faq-list">
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx
              return (
                <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {isOpen && (
                    <div className="faq-answer-content">
                      {faq.a.map((paragraph, pIdx) => (
                        <p key={pIdx} className="faq-answer-p">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* System Diagnostics & Cache Reload */}
        <div className="support-diagnostics-row">
          <div className="support-diagnostics-info">
            <div className="diagnostics-badge">
              <span className="diagnostics-status-dot" />
              <span>Database Online</span>
            </div>
            <span className="diagnostics-version">JARVIS v1.4.0 (PWA)</span>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleClearCache}
            title="Force reload all offline cached resources"
          >
            <RefreshCw size={13} /> Clear Cache & Reload
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="settings-section">
        <div className="settings-section-title" style={{ color: 'var(--error)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={14} /> Account</div>
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Logout</div>
            <div className="settings-row-sub">Sign out of your account</div>
          </div>
          <button className="btn btn-danger" onClick={handleLogout}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </div>
  )
}
