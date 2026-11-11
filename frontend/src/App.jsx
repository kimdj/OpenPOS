import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import RequireAuth from './components/RequireAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Register from './pages/Register' // tela do Caixa (PDV)
import Products from './pages/Products'
import Sales from './pages/Sales'
import Dashboard from './pages/Dashboard'
import Store from './pages/Store' // loja do cliente (pública)

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registrar" element={<SignUp />} />
            <Route path="/loja/:username" element={<Store />} />

            <Route
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            >
              <Route path="/" element={<Register />} />
              <Route path="/produtos" element={<Products />} />
              <Route path="/vendas" element={<Sales />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
