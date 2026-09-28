import { useState, useRef } from 'react'
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

/* ── Constants ── */
const FAB_SIZE = 54
const MARGIN = 10
const DRAG_THRESHOLD = 4 // px moved before it counts as drag

function getDefaultPos() {
  if (typeof window === 'undefined') return { x: 300, y: 500 }
  return {
    x: window.innerWidth - FAB_SIZE - 16,
    y: window.innerHeight - FAB_SIZE - 28,
  }
}

function clampPos(x, y) {
  if (typeof window === 'undefined') return { x, y }
  return {
    x: Math.max(MARGIN, Math.min(window.innerWidth  - FAB_SIZE - MARGIN, x)),
    y: Math.max(MARGIN, Math.min(window.innerHeight - FAB_SIZE - MARGIN, y)),
  }
}

function loadPos() {
  try {
    const s = localStorage.getItem('qa-fab-pos')
    if (s) {
      const p = JSON.parse(s)
      return clampPos(p.x, p.y)
    }
  } catch {}
  return getDefaultPos()
}

/* ── Main QuickAdd component ── */
export default function QuickAdd() {
  const { user } = useAuth()
  const [open, setOpen]   = useState(false)
  const [active, setActive] = useState(null)
  const [pos, setPos]     = useState(loadPos)
  const [dragging, setDragging] = useState(false)

  const fabRef = useRef(null)

  // Refs for high-performance direct dragging
  const isDragging   = useRef(false)
  const hasMoved     = useRef(false)
  const startPtr     = useRef({ x: 0, y: 0 })
  const startPos     = useRef({ x: 0, y: 0 })
  const currentPos   = useRef(pos)
  const posRef       = useRef(pos)
  posRef.current = pos

  // Re-clamp position on window resize or orientation change
  useEffect(() => {
    function handleResize() {
      setPos(p => {
        const clamped = clampPos(p.x, p.y)
        localStorage.setItem('qa-fab-pos', JSON.stringify(clamped))
        return clamped
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  /* ── Pointer down — start drag ── */
  function onPointerDown(e) {
    if (e.button && e.button !== 0) return   // ignore right-click
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
    isDragging.current = true
    hasMoved.current   = false
    startPtr.current   = { x: e.clientX, y: e.clientY }
    startPos.current   = { ...posRef.current }
    currentPos.current = { ...posRef.current }
  }

  /* ── Pointer move — direct GPU drag ── */
  function onPointerMove(e) {
    if (!isDragging.current) return
    const dx = e.clientX - startPtr.current.x
    const dy = e.clientY - startPtr.current.y

    if (!hasMoved.current && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
      hasMoved.current = true
      setOpen(false)      // close fan if open while dragging
      setDragging(true)
    }

    if (hasMoved.current) {
      const newPos = clampPos(startPos.current.x + dx, startPos.current.y + dy)
      currentPos.current = newPos
      if (fabRef.current) {
        fabRef.current.style.transform = `translate3d(${newPos.x}px, ${newPos.y}px, 0)`
      }
    }
  }

  /* ── Pointer up — end drag or fire click ── */
  function onPointerUp(e) {
    if (!isDragging.current) return
    if (e.currentTarget && e.pointerId) {
      try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
    }
    const moved = hasMoved.current
    isDragging.current = false
    hasMoved.current   = false
    setDragging(false)

    if (!moved) {
      // Tap — toggle fan-out menu
      setOpen(o => !o)
    } else {
      // Drag ended — sync React state and save position
      const finalPos = currentPos.current
      setPos(finalPos)
      posRef.current = finalPos
      localStorage.setItem('qa-fab-pos', JSON.stringify(finalPos))
    }
  }

  function handleAction(key) {
    setOpen(false)
    setActive(key)
  }

  function handleDone() { setActive(null) }

  /* ── Dynamic menu position ── */
  const spaceAbove = pos.y
  const spaceBelow = window.innerHeight - pos.y - FAB_SIZE
  const fanUp = spaceAbove >= spaceBelow

  const menuLeft = Math.max(MARGIN, Math.min(
    window.innerWidth - 188 - MARGIN,
    pos.x + FAB_SIZE - 188
  ))

  const menuStyle = fanUp
    ? { left: menuLeft, bottom: window.innerHeight - pos.y + 8, flexDirection: 'column' }
    : { left: menuLeft, top: pos.y + FAB_SIZE + 8,              flexDirection: 'column-reverse' }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="qa-backdrop" onClick={() => setOpen(false)} />
      )}

      {/* Fan-out menu — dynamically positioned */}
      <div
        className={`qa-actions ${open ? 'qa-actions-open' : ''}`}
        style={{ ...menuStyle, right: 'unset', bottom: menuStyle.bottom }}
      >
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

      {/* Draggable FAB */}
      <button
        ref={fabRef}
        className={`qa-fab ${open ? 'qa-fab-open' : ''} ${dragging ? 'qa-fab-dragging' : ''}`}
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-label="Quick Add — drag to move"
        title="Tap to add • Hold & drag to move"
      >
        <span className="qa-fab-icon">
          {open ? <X size={22} /> : <Plus size={22} />}
        </span>
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
