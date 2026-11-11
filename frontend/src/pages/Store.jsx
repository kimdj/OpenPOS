// LOJA DO CLIENTE — interface pública onde o cliente simula uma compra.
// Acessada por /loja/<username-do-lojista>, sem login. Usa as rotas
// /api/public/... e o MESMO serviço de checkout do Caixa no back-end:
// estoque baixa automaticamente e o desconto de 5% (> R$ 200) é aplicado.

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'
import { formatCurrency } from '../hooks/useCurrency'
import { useCart } from '../hooks/useCart'
import { usePricingRules } from '../utils/pricing'
import CartTotals from '../components/CartTotals'
import './Register.css' // reaproveita carrinho/abas do Caixa
import './Store.css'

const CATEGORY_LABELS = { all: 'Todos', Foods: 'Comidas', Drinks: 'Bebidas', Other: 'Outros' }

export default function Store() {
  const { username } = useParams()
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [buying, setBuying] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const rules = usePricingRules()
  const { cart, totals, qtyOf, add, changeQty, remove, clear } = useCart(rules)
  const { push } = useToast()
  const percent = Math.round(rules.discountRate * 100)

  useEffect(() => {
    loadStore()
  }, [username])

  async function loadStore() {
    try {
      const data = await api.getStore(username)
      setStore(data.store)
      setProducts(data.products)
    } catch (err) {
      if (err.status === 404) setNotFound(true)
      else push('Não foi possível carregar a loja.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter(
      (p) => (category === 'all' || p.category === category) && (!term || p.name.toLowerCase().includes(term))
    )
  }, [products, category, search])

  function handleAdd(product) {
    if (!add(product)) push(`Não há mais unidades de ${product.name} em estoque.`, 'error')
  }

  async function handleBuy() {
    if (!cart.length) return
    setBuying(true)
    try {
      const result = await api.buyFromStore(username, cart)
      setReceipt(result)
      clear()
    } catch (err) {
      push(err.message || 'Não foi possível concluir a compra.', 'error')
    } finally {
      setBuying(false)
      loadStore() // atualiza o estoque exibido
    }
  }

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="store-shell">
        <div className="empty-state">
          <div className="empty-state-title">Loja não encontrada</div>
          <p>Confira o endereço com o mercado.</p>
        </div>
      </div>
    )
  }

  const itemsCount = cart.reduce((n, i) => n + i.qty, 0)

  return (
    <div className="store-shell">
      <header className="store-header">
        <div className="store-brand">
          <span className="sidebar-mark">{(store?.name || username)[0].toUpperCase()}</span>
          <div>
            <h1>{store?.name || username}</h1>
            <p>Compre online · retire na loja</p>
          </div>
        </div>
        <div className="store-promo">
          <strong>{percent}% OFF</strong> em compras acima de {formatCurrency(rules.discountThreshold)}
        </div>
      </header>

      <div className="store-layout">
        <section>
          <div className="store-toolbar">
            <input
              className="store-search"
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="category-tabs">
              {Object.keys(CATEGORY_LABELS).map((cat) => (
                <button
                  key={cat}
                  className={`category-tab${category === cat ? ' active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">Nenhum produto encontrado</div>
            </div>
          ) : (
            <div className="store-grid">
              {visible.map((p) => {
                const available = p.stock - qtyOf(p._id)
                return (
                  <article key={p._id} className={`store-card${p.stock <= 0 ? ' sold-out' : ''}`}>
                    <span className={`badge badge-${p.category.toLowerCase()}`}>{CATEGORY_LABELS[p.category]}</span>
                    <h3>{p.name}</h3>
                    <div className="store-card-price mono">{formatCurrency(p.price)}</div>
                    <div className="store-card-stock">
                      {p.stock <= 0 ? 'Esgotado' : `${p.stock} em estoque`}
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={available <= 0}
                      onClick={() => handleAdd(p)}
                    >
                      {p.stock <= 0 ? 'Indisponível' : available <= 0 ? 'Limite do estoque' : 'Adicionar'}
                    </button>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <aside className="cart-panel store-cart">
          <div className="cart-header">
            <h2>Seu carrinho {itemsCount > 0 && <span className="mono">({itemsCount})</span>}</h2>
            {cart.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clear}>
                Esvaziar
              </button>
            )}
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <p>Seu carrinho está vazio</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-unit mono">{formatCurrency(item.price)} un.</span>
                  </div>
                  <div className="cart-item-controls">
                    <button className="qty-btn" onClick={() => changeQty(item.productId, -1)}>−</button>
                    <span className="qty-value mono">{item.qty}</span>
                    <button className="qty-btn" onClick={() => changeQty(item.productId, 1)} disabled={item.qty >= item.stock}>+</button>
                  </div>
                  <span className="cart-item-total mono">{formatCurrency(item.price * item.qty)}</span>
                  <button className="cart-item-remove" onClick={() => remove(item.productId)} aria-label="Remover item">
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="cart-footer">
            <CartTotals totals={totals} rules={rules} />
            <button className="btn btn-primary checkout-btn" disabled={!cart.length || buying} onClick={handleBuy}>
              {buying ? 'Processando...' : 'Finalizar compra'}
            </button>
          </div>
        </aside>
      </div>

      {receipt && <Receipt receipt={receipt} onClose={() => setReceipt(null)} />}
    </div>
  )
}

function Receipt({ receipt, onClose }) {
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="store-receipt" onClick={(e) => e.stopPropagation()}>
        <div className="store-receipt-head">
          <span className="store-receipt-check">✓</span>
          <div>
            <h3>Compra confirmada!</h3>
            <p className="mono">Pedido #{String(receipt.orderNumber).padStart(4, '0')}</p>
          </div>
        </div>

        <div className="store-receipt-lines">
          {receipt.items.map((item, i) => (
            <div key={i} className="store-receipt-line">
              <span>{item.qty}× {item.name}</span>
              <span className="mono">{formatCurrency(item.price * item.qty)}</span>
            </div>
          ))}
        </div>

        <div className="store-receipt-line muted">
          <span>Subtotal</span>
          <span className="mono">{formatCurrency(receipt.subtotal)}</span>
        </div>
        {receipt.discount > 0 && (
          <div className="store-receipt-line discount">
            <span>Desconto ({Math.round(receipt.discountRate * 100)}%)</span>
            <span className="mono">− {formatCurrency(receipt.discount)}</span>
          </div>
        )}
        <div className="store-receipt-line total">
          <span>Total</span>
          <span className="mono">{formatCurrency(receipt.total)}</span>
        </div>

        <button className="btn btn-primary checkout-btn" onClick={onClose}>
          Continuar comprando
        </button>
      </div>
    </div>
  )
}
