import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import { formatCurrency, formatDate, CATEGORY_COLORS } from '../utils/helpers'
import { TrendingUp, TrendingDown, Scale, Award, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

/* ── helpers ── */
function currentYearMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function labelFromYM(ym) {
  const [y, m] = ym.split('-')
  const d = new Date(+y, +m - 1, 1)
  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
}

function prevMonth(ym) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth(ym) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthRange(ym) {
  const [y, m] = ym.split('-').map(Number)
  const start = `${y}-${String(m).padStart(2, '0')}-01`
  const lastDay = new Date(y, m, 0).getDate()
  const end = `${y}-${String(m).padStart(2, '0')}-${lastDay}`
  return { start, end }
}

function getLast6Months() {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

/* ── Custom tooltip ── */
const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value, pct } = payload[0].payload
  return (
    <div className="chart-tooltip">
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{name}</div>
      <div>{formatCurrency(value)} <span style={{ color: 'var(--text-muted)' }}>({pct}%)</span></div>
    </div>
  )
}

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, fontSize: 12 }}>
          {p.name}: {formatCurrency(p.value)}
        </div>
      ))}
    </div>
  )
}

/* ── Main component ── */
export default function Reports() {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(currentYearMonth())
  const [loading, setLoading] = useState(true)

  // Month data
  const [totalReceived, setTotalReceived] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [categoryData, setCategoryData] = useState([])
  const [biggestExpense, setBiggestExpense] = useState(null)
  const [last6Data, setLast6Data] = useState([])

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { start, end } = monthRange(selectedMonth)

      // Fetch expenses & money for selected month in parallel
      const [expRes, moneyRes] = await Promise.all([
        supabase.from('expenses').select('*')
          .eq('user_id', user.id).gte('date', start).lte('date', end).order('amount', { ascending: false }),
        supabase.from('money_received').select('*')
          .eq('user_id', user.id).gte('date', start).lte('date', end),
      ])

      const expenses = expRes.data || []
      const money = moneyRes.data || []

      // Totals
      const spent = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0)
      const received = money.reduce((s, m) => s + parseFloat(m.amount || 0), 0)
      setTotalSpent(spent)
      setTotalReceived(received)

      // Biggest expense
      setBiggestExpense(expenses[0] || null)

      // Category breakdown for pie chart
      const catMap = {}
      expenses.forEach(e => {
        catMap[e.category] = (catMap[e.category] || 0) + parseFloat(e.amount || 0)
      })
      const catArr = Object.entries(catMap)
        .map(([name, value]) => ({
          name,
          value: Math.round(value),
          pct: spent > 0 ? Math.round((value / spent) * 100) : 0,
          fill: CATEGORY_COLORS[name] || '#78909c',
        }))
        .sort((a, b) => b.value - a.value)
      setCategoryData(catArr)

      // Last 6 months bar chart
      const months6 = getLast6Months()
      const earliest = months6[0]
      const { start: s6 } = monthRange(earliest)
      const { end: e6 } = monthRange(months6[months6.length - 1])

      const [allExp, allMon] = await Promise.all([
        supabase.from('expenses').select('amount, date')
          .eq('user_id', user.id).gte('date', s6).lte('date', e6),
        supabase.from('money_received').select('amount, date')
          .eq('user_id', user.id).gte('date', s6).lte('date', e6),
      ])

      const expByMonth = {}, monByMonth = {}
      months6.forEach(m => { expByMonth[m] = 0; monByMonth[m] = 0 });
      (allExp.data || []).forEach(e => {
        const ym = e.date.slice(0, 7)
        if (expByMonth[ym] !== undefined) expByMonth[ym] += parseFloat(e.amount || 0)
      });
      (allMon.data || []).forEach(m => {
        const ym = m.date.slice(0, 7)
        if (monByMonth[ym] !== undefined) monByMonth[ym] += parseFloat(m.amount || 0)
      })

      setLast6Data(months6.map(ym => ({
        month: labelFromYM(ym),
        Received: Math.round(monByMonth[ym]),
        Spent: Math.round(expByMonth[ym]),
      })))
    } catch (err) {
      toast.error('Failed to load report')
    } finally {
      setLoading(false)
    }
  }, [user, selectedMonth])

  useEffect(() => { loadData() }, [loadData])

  const balance = totalReceived - totalSpent
  const isProfit = balance >= 0
  const monthLabel = new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Monthly Report</div>
        <div className="page-subtitle">Detailed breakdown of your finances</div>
      </div>

      {/* Month Picker */}
      <div className="report-month-picker">
        <button className="btn btn-ghost btn-icon" onClick={() => setSelectedMonth(prevMonth(selectedMonth))}>
          <ChevronLeft size={18} />
        </button>
        <div className="report-month-label">{monthLabel}</div>
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => setSelectedMonth(nextMonth(selectedMonth))}
          disabled={selectedMonth >= currentYearMonth()}
        >
          <ChevronRight size={18} />
        </button>
        <input
          type="month"
          className="form-input report-month-input"
          value={selectedMonth}
          max={currentYearMonth()}
          onChange={e => setSelectedMonth(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <>
          {/* ── Summary Cards ── */}
          <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
            <div className="summary-card">
              <div className="summary-card-label">
                <TrendingUp size={12} style={{ marginRight: 5, color: 'var(--success)', verticalAlign: 'middle' }} />
                Total Received
              </div>
              <div className="summary-card-value" style={{ color: 'var(--success)' }}>{formatCurrency(totalReceived)}</div>
            </div>
            <div className="summary-card">
              <div className="summary-card-label">
                <TrendingDown size={12} style={{ marginRight: 5, color: 'var(--error)', verticalAlign: 'middle' }} />
                Total Spent
              </div>
              <div className="summary-card-value" style={{ color: 'var(--error)' }}>{formatCurrency(totalSpent)}</div>
            </div>
            <div className="summary-card">
              <div className="summary-card-label">
                <Scale size={12} style={{ marginRight: 5, color: 'var(--accent-gold)', verticalAlign: 'middle' }} />
                Net Balance
              </div>
              <div className="summary-card-value" style={{ color: isProfit ? 'var(--success)' : 'var(--error)' }}>
                {isProfit ? '+' : ''}{formatCurrency(balance)}
              </div>
            </div>
          </div>

          {/* ── Pie Chart + Biggest Expense ── */}
          <div className="report-grid">

            {/* Category Breakdown */}
            <div className="card report-card">
              <div className="report-card-title">💸 Expense by Category</div>
              {categoryData.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px 0' }}>
                  <div className="empty-state-icon">📊</div>
                  <p>No expenses this month</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="report-legend">
                    {categoryData.map(cat => (
                      <div key={cat.name} className="report-legend-item">
                        <span className="report-legend-dot" style={{ background: cat.fill }} />
                        <span className="report-legend-name">{cat.name}</span>
                        <span className="report-legend-value">{formatCurrency(cat.value)}</span>
                        <span className="report-legend-pct">{cat.pct}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Biggest Expense */}
            <div className="card report-card">
              <div className="report-card-title">🏆 Biggest Expense</div>
              {!biggestExpense ? (
                <div className="empty-state" style={{ padding: '40px 0' }}>
                  <div className="empty-state-icon">🎉</div>
                  <p>No expenses this month!</p>
                </div>
              ) : (
                <div className="biggest-expense-display">
                  <div className="biggest-expense-icon">
                    <Award size={32} color="var(--accent-gold)" />
                  </div>
                  <div className="biggest-expense-amount">{formatCurrency(biggestExpense.amount)}</div>
                  <div className="biggest-expense-note">{biggestExpense.note || '—'}</div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
                    <span className="badge badge-red">{biggestExpense.category}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
                      {formatDate(biggestExpense.date)}
                    </span>
                  </div>

                  {/* Top 3 expenses list */}
                  <div className="biggest-expense-subtitle">Top Expenses</div>
                  <div className="top-expenses-list">
                    {categoryData.slice(0, 5).map((cat, i) => (
                      <div key={cat.name} className="top-expense-row">
                        <span className="top-expense-rank">#{i + 1}</span>
                        <span
                          className="top-expense-dot"
                          style={{ background: cat.fill }}
                        />
                        <span className="top-expense-name">{cat.name}</span>
                        <div className="top-expense-bar-wrap">
                          <div
                            className="top-expense-bar"
                            style={{ width: `${cat.pct}%`, background: cat.fill }}
                          />
                        </div>
                        <span className="top-expense-val">{formatCurrency(cat.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Month-by-Month Bar Chart ── */}
          <div className="card" style={{ marginTop: 20, padding: '20px' }}>
            <div className="report-card-title" style={{ marginBottom: 20 }}>📈 Last 6 Months Overview</div>
            {last6Data.every(d => d.Received === 0 && d.Spent === 0) ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <div className="empty-state-icon">📉</div>
                <p>No data in the last 6 months yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={last6Data} barCategoryGap="30%" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={false} tickLine={false}
                    tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                    width={48}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)', paddingTop: 12 }}
                  />
                  <Bar dataKey="Received" fill="var(--success)" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="Spent" fill="var(--accent-red)" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  )
}
