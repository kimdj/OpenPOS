import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'
import { formatCurrency } from '../hooks/useCurrency'
import { useCart } from '../hooks/useCart'
import { usePricingRules } from '../utils/pricing'
import CartTotals from '../components/CartTotals'
import './Register.css'

const CATEGORIES = ['Foods', 'Drinks', 'Other']
const CATEGORY_LABELS = { Foods: 'Comidas', Drinks: 'Bebidas', Other: 'Outros' }

export default function Register() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Foods')
  const rules = usePricingRules()
  const { cart, totals, qtyOf, add, changeQty, remove: removeFromCart, clear: clearCart } = useCart(rules)
  const [clock, setClock] = useState(new Date())
  const [checkingOut, setCheckingOut] = useState(false)
  const [lastOrder, setLastOrder] = useState(null)
  const { push } = useToast()

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)
    try {
      const data = await api.getProducts()
      setProducts(data)
    } catch (err) {
      push('Não foi possível carregar os produtos.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const productsByCategory = useMemo(() => {
    const grouped = { Foods: [], Drinks: [], Other: [] }
    products.forEach((p) => {
      if (grouped[p.category]) grouped[p.category].push(p)
    })
    return grouped
  }, [products])

  function addToCart(product) {
    if (!add(product)) {
      push(`Sem estoque suficiente de ${product.name}.`, 'error')
    }
  }

  async function checkout() {
    if (!cart.length) return
    setCheckingOut(true)
    try {
      const sale = await api.createSale(cart)
      setLastOrder(sale)
      clearCart()
      push(`Venda #${sale.orderNumber} registrada com sucesso.`, 'success')
    } catch (err) {
      // 409 = estoque insuficiente; a mensagem do servidor diz qual produto.
      push(err.message || 'Não foi possível finalizar a venda.', 'error')
    } finally {
      loadProducts() // estoque mudou (baixa automática) — atualiza a vitrine
      setCheckingOut(false)
    }
  }

  return (
    <div className="register-layout">
      <section className="register-main">
        <div className="register-toolbar">
          <div>
            <h1 className="page-title">Caixa</h1>
            <p className="page-subtitle mono">
              {clock.toLocaleDateString('pt-BR')} · {clock.toLocaleTimeString('pt-BR')}
            </p>
          </div>

          <div className="category-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-tab${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {CATEGORY_LABELS[cat]}
                <span className="category-count">{productsByCategory[cat].length}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-page">
            <div className="spinner" />
          </div>
        ) : productsByCategory[activeCategory].length === 0 ? (
          <div className="empty-state">
            <IconBox />
            <div className="empty-state-title">Nenhum produto em {CATEGORY_LABELS[activeCategory]}</div>
            <p>Cadastre itens na aba Produtos para começar a vender.</p>
          </div>
        ) : (
          <div className="product-grid">
            {productsByCategory[activeCategory].map((product) => {
              const available = (product.stock ?? 0) - qtyOf(product._id)
              return (
                <button
                  key={product._id}
                  className={`product-tile${available <= 0 ? ' out-of-stock' : ''}`}
                  onClick={() => addToCart(product)}
                  disabled={available <= 0}
                >
                  <span className="product-tile-name">{product.name}</span>
                  <span className="product-tile-footer">
                    <span className="product-tile-price mono">{formatCurrency(product.price)}</span>
                    <span className={`stock-pill${available <= 0 ? ' empty' : available <= 5 ? ' low' : ''}`}>
                      {available <= 0 ? 'Esgotado' : `${available} un.`}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </section>

      <aside className="cart-panel">
        <div className="cart-header">
          <h2>Pedido atual</h2>
          {cart.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearCart}>
              Limpar
            </button>
          )}
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <IconCart />
              <p>Toque em um produto para adicionar ao pedido</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="cart-item">
                <div className="cart-item-info">
                  <span className="cart-item-name">{item.name}</span>
                  <span className="cart-item-unit mono">{formatCurrency(item.price)} un.</span>
                </div>
                <div className="cart-item-controls">
                  <button className="qty-btn" onClick={() => changeQty(item.productId, -1)}>
                    −
                  </button>
                  <span className="qty-value mono">{item.qty}</span>
                  <button className="qty-btn" onClick={() => changeQty(item.productId, 1)}>
                    +
                  </button>
                </div>
                <span className="cart-item-total mono">
                  {formatCurrency(item.price * item.qty)}
                </span>
                <button className="cart-item-remove" onClick={() => removeFromCart(item.productId)} aria-label="Remover item">
                  <IconTrash />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <CartTotals totals={totals} rules={rules} />
          <button
            className="btn btn-primary checkout-btn"
            disabled={!cart.length || checkingOut}
            onClick={checkout}
          >
            {checkingOut ? 'Finalizando...' : 'Finalizar venda'}
          </button>
        </div>
      </aside>

      {lastOrder && (
        <div className="receipt-toast" onClick={() => setLastOrder(null)}>
          <div className="receipt-card">
            <IconCheck />
            <div>
              <div className="receipt-title">Venda #{lastOrder.orderNumber} concluída</div>
              <div className="receipt-total mono">{formatCurrency(lastOrder.total)}</div>
              {lastOrder.discount > 0 && (
                <div className="receipt-discount mono">
                  Desconto aplicado: {formatCurrency(lastOrder.discount)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function IconBox() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 8 12 3 3 8l9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" />
    </svg>
  )
}
function IconCart() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" />
      <path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 8H6" />
    </svg>
  )
}
function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" />
    </svg>
  )
}
