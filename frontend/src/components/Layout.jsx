import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

const NAV_ITEMS = [
  { to: '/', label: 'Caixa', icon: IconRegister },
  { to: '/produtos', label: 'Produtos', icon: IconBox },
  { to: '/vendas', label: 'Vendas', icon: IconReceipt },
  { to: '/dashboard', label: 'Painel', icon: IconChart },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-mark">OP</span>
          <div>
            <div className="sidebar-title">OpenPOS</div>
            <div className="sidebar-subtitle">ponto de venda</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {user && (
          <a
            className="sidebar-link sidebar-store-link"
            href={`/loja/${encodeURIComponent(user.username)}`}
            target="_blank"
            rel="noreferrer"
          >
            <IconStore />
            <span>Loja do cliente ↗</span>
          </a>
        )}

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{(user?.username || '?')[0].toUpperCase()}</div>
            <div>
              <div className="sidebar-username">{user?.name || user?.username}</div>
              <div className="sidebar-username-sub">@{user?.username}</div>
            </div>
          </div>
          <a href="/users/logout" className="sidebar-logout" onClick={(e) => { e.preventDefault(); handleLogout() }}>
            Sair
          </a>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

function IconRegister() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="8" width="18" height="12" rx="1.5" />
      <path d="M7 8V6a5 5 0 0 1 10 0v2" />
      <path d="M12 12v4M9 14h6" />
    </svg>
  )
}
function IconBox() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 8 12 3 3 8l9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  )
}
function IconReceipt() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  )
}
function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19V5M4 19h16" />
      <path d="M8 15v-3M12 15V8M16 15v-6" />
    </svg>
  )
}
function IconStore() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9h18l-1.5-5h-15Z" />
      <path d="M5 9v11h14V9" />
      <path d="M10 20v-6h4v6" />
    </svg>
  )
}
