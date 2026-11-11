import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'
import { formatCurrency } from '../hooks/useCurrency'
import './Dashboard.css'

const CATEGORY_LABELS = { Foods: 'Comidas', Drinks: 'Bebidas', Other: 'Outros' }
const CATEGORY_COLORS = { Foods: '#e2a836', Drinks: '#4d8de0', Other: '#96a2b0' }

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { push } = useToast()

  useEffect(() => {
    api
      .getStats()
      .then(setStats)
      .catch(() => push('Não foi possível carregar as estatísticas.', 'error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    )
  }

  const hasData = stats && stats.totalOrders > 0

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Painel</h1>
          <p className="page-subtitle">Visão geral do desempenho de vendas</p>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard label="Receita total" value={formatCurrency(stats?.totalRevenue)} accent />
        <KpiCard label="Pedidos finalizados" value={stats?.totalOrders ?? 0} />
        <KpiCard label="Ticket médio" value={formatCurrency(stats?.averageOrder)} />
        <KpiCard
          label={`Descontos · ${stats?.discountedOrders ?? 0} pedido(s)`}
          value={formatCurrency(stats?.totalDiscount)}
        />
      </div>

      {!hasData ? (
        <div className="empty-state">
          <IconChart />
          <div className="empty-state-title">Ainda não há dados suficientes</div>
          <p>Finalize algumas vendas no Caixa para ver os gráficos aqui.</p>
        </div>
      ) : (
        <div className="dashboard-charts">
          <div className="card chart-card chart-card-wide">
            <h3>Receita nos últimos dias</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.byDay} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#17b978" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#17b978" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e3c4d" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  tick={{ fill: '#6b7889', fontSize: 11 }}
                  axisLine={{ stroke: '#2e3c4d' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6b7889', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatCurrency(v).replace(',00', '')}
                  width={70}
                />
                <Tooltip
                  contentStyle={{ background: '#1a232e', border: '1px solid #2e3c4d', borderRadius: 10, fontSize: 12.5 }}
                  labelStyle={{ color: '#c3cad3' }}
                  formatter={(v) => [formatCurrency(v), 'Receita']}
                  labelFormatter={(d) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')}
                />
                <Area type="monotone" dataKey="total" stroke="#17b978" strokeWidth={2} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card chart-card">
            <h3>Receita por categoria</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.byCategory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e3c4d" vertical={false} />
                <XAxis
                  dataKey="category"
                  tickFormatter={(c) => CATEGORY_LABELS[c] || c}
                  tick={{ fill: '#6b7889', fontSize: 11 }}
                  axisLine={{ stroke: '#2e3c4d' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6b7889', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatCurrency(v).replace(',00', '')}
                  width={70}
                />
                <Tooltip
                  contentStyle={{ background: '#1a232e', border: '1px solid #2e3c4d', borderRadius: 10, fontSize: 12.5 }}
                  formatter={(v, _n, item) => [formatCurrency(v), CATEGORY_LABELS[item.payload.category]]}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {stats.byCategory.map((entry) => (
                    <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || '#96a2b0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

function KpiCard({ label, value, accent }) {
  return (
    <div className="card kpi-card">
      <span className="kpi-label">{label}</span>
      <span className={`kpi-value mono${accent ? ' kpi-accent' : ''}`}>{value}</span>
    </div>
  )
}

function IconChart() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19V5M4 19h16" /><path d="M8 15v-3M12 15V8M16 15v-6" />
    </svg>
  )
}
