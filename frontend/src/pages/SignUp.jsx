import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const EMPTY = { name: '', email: '', username: '', password: '', password2: '' }

export default function Register() {
  const [values, setValues] = useState(EMPTY)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { register, login } = useAuth()
  const navigate = useNavigate()

  function update(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (values.password !== values.password2) {
      setError('As senhas não coincidem')
      return
    }
    if (values.password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres')
      return
    }

    setSubmitting(true)
    try {
      await register(values)
      // registro concluído — loga automaticamente para não precisar de um passo extra
      await login(values.username, values.password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(translateError(err.message))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-mark">OP</span>
          <span>OpenPOS</span>
        </div>

        <h1>Criar conta</h1>
        <p className="auth-subtitle">Leva menos de um minuto.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="name">Nome</label>
            <input id="name" value={values.name} onChange={update('name')} placeholder="Seu nome" autoFocus required />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" value={values.email} onChange={update('email')} placeholder="voce@email.com" required />
          </div>
          <div className="field">
            <label htmlFor="reg-username">Usuário</label>
            <input id="reg-username" value={values.username} onChange={update('username')} placeholder="seu.usuario" required />
          </div>
          <div className="auth-form-row">
            <div className="field">
              <label htmlFor="reg-password">Senha</label>
              <input id="reg-password" type="password" value={values.password} onChange={update('password')} placeholder="••••••••" required />
            </div>
            <div className="field">
              <label htmlFor="reg-password2">Confirmar senha</label>
              <input id="reg-password2" type="password" value={values.password2} onChange={update('password2')} placeholder="••••••••" required />
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
            {submitting ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-footer">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}

function translateError(message) {
  if (message === 'Username already taken') return 'Esse usuário já existe'
  if (message === 'Email is not valid') return 'E-mail inválido'
  if (message === 'Name is required') return 'Informe seu nome'
  if (message === 'Email is required') return 'Informe seu e-mail'
  if (message === 'Username is required') return 'Informe um usuário'
  return 'Não foi possível criar a conta. Tente novamente.'
}
