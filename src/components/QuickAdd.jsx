import { useState } from 'react'
import { Plus, X, Wallet, Receipt, BookOpen, StickyNote } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { moneyService } from '../services/moneyService'
import { expenseService } from '../services/expenseService'
import { experienceService } from '../services/experienceService'
import { noteService } from '../services/noteService'
import { todayISO, EXPENSE_CATEGORIES, MONEY_SOURCES, EXPERIENCE_CATEGORIES, NOTE_CATEGORIES } from '../utils/helpers'
import toast from 'react-hot-toast'

const ACTIONS = [
  { key: 'note',       label: 'Note',       icon: StickyNote, color: '#3b82f6' },
  { key: 'experience', label: 'Experience', icon: BookOpen,   color: '#d4a017' },
  { key: 'expense',    label: 'Expense',    icon: Receipt,    color: '#ef4444' },
  { key: 'money',      label: 'Money',      icon: Wallet,     color: '#22c55e' },
]

/* ── Mini forms ── */
function MoneyForm({ onClose, onDone, userId }) {
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('Parents')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return }
    setLoading(true)
    try {
      await moneyService.add({ user_id: userId, amount: parseFloat(amount), source, date, note })
      toast.success('Money added! 💰')
      onDone()
    } catch { toast.error('Failed to add') } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Amount (₹)</label>
          <input className="form-input" type="number" min="1" step="0.01" placeholder="500"
            autoFocus value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Source</label>
            <select className="form-select" value={source} onChange={e => setSource(e.target.value)}>
              {MONEY_SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Note (optional)</label>
          <input className="form-input" type="text" placeholder="Pocket money" value={note} onChange={e => setNote(e.target.value)} />
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> : 'Add'}
        </button>
      </div>
    </form>
  )
}

function ExpenseForm({ onClose, onDone, userId }) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return }
    setLoading(true)
    try {
      await expenseService.add({ user_id: userId, amount: parseFloat(amount), category, date, note })
      toast.success('Expense logged! 🧾')
      onDone()
    } catch { toast.error('Failed to add') } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Amount (₹)</label>
          <input className="form-input" type="number" min="1" step="0.01" placeholder="150"
            autoFocus value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
              {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Note (optional)</label>
          <input className="form-input" type="text" placeholder="Lunch at canteen" value={note} onChange={e => setNote(e.target.value)} />
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> : 'Add'}
        </button>
      </div>
    </form>
  )
}

function ExperienceForm({ onClose, onDone, userId }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('College')
  const [date, setDate] = useState(todayISO())
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!title.trim()) { toast.error('Enter a title'); return }
    setLoading(true)
    try {
      await experienceService.add({ user_id: userId, title, category, date, description })
      toast.success('Experience saved! 📖')
      onDone()
    } catch { toast.error('Failed to add') } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" type="text" placeholder="Completed ESP32 project"
            autoFocus value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
              {EXPERIENCE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Description (optional)</label>
          <textarea className="form-textarea" style={{ minHeight: 72 }} placeholder="What happened?"
            value={description} onChange={e => setDescription(e.target.value)} />
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> : 'Add'}
        </button>
      </div>
    </form>
  )
}

function NoteForm({ onClose, onDone, userId }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Personal')
  const [date] = useState(todayISO())
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!title.trim()) { toast.error('Enter a title'); return }
    setLoading(true)
    try {
      await noteService.add({ user_id: userId, title, content, category, date })
      toast.success('Note saved! 📝')
      onDone()
    } catch { toast.error('Failed to add') } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" type="text" placeholder="Quick idea..."
            autoFocus value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
            {NOTE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Content (optional)</label>
          <textarea className="form-textarea" style={{ minHeight: 80 }} placeholder="Write your note..."
            value={content} onChange={e => setContent(e.target.value)} />
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> : 'Add'}
        </button>
      </div>
    </form>
  )
}

/* ── Modal wrapper titles ── */
const MODAL_TITLES = {
  money: '💰 Quick Add — Money',
  expense: '🧾 Quick Add — Expense',
  experience: '📖 Quick Add — Experience',
  note: '📝 Quick Add — Note',
}

/* ── Main QuickAdd component ── */
export default function QuickAdd() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(null) // which modal is open

  function handleAction(key) {
    setOpen(false)
    setActive(key)
  }

  function handleDone() {
    setActive(null)
  }

  return (
    <>
      {/* Fan-out backdrop */}
      {open && (
        <div className="qa-backdrop" onClick={() => setOpen(false)} />
      )}

      {/* Fan-out action buttons */}
      <div className={`qa-actions ${open ? 'qa-actions-open' : ''}`}>
        {ACTIONS.map(({ key, label, icon: Icon, color }, i) => (
          <button
            key={key}
            className="qa-action-btn"
            style={{ '--qa-color': color, '--qa-delay': `${i * 40}ms` }}
            onClick={() => handleAction(key)}
            title={label}
          >
            <Icon size={16} />
            <span className="qa-action-label">{label}</span>
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <button
        className={`qa-fab ${open ? 'qa-fab-open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Quick Add"
      >
        {open ? <X size={22} /> : <Plus size={22} />}
      </button>

      {/* Quick-add modals */}
      {active && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setActive(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{MODAL_TITLES[active]}</div>
              <button className="modal-close" onClick={() => setActive(null)}><X size={18} /></button>
            </div>
            {active === 'money'      && <MoneyForm      onClose={() => setActive(null)} onDone={handleDone} userId={user?.id} />}
            {active === 'expense'    && <ExpenseForm    onClose={() => setActive(null)} onDone={handleDone} userId={user?.id} />}
            {active === 'experience' && <ExperienceForm onClose={() => setActive(null)} onDone={handleDone} userId={user?.id} />}
            {active === 'note'       && <NoteForm       onClose={() => setActive(null)} onDone={handleDone} userId={user?.id} />}
          </div>
        </div>
      )}
    </>
  )
}
