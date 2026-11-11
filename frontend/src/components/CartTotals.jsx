import { formatCurrency } from '../hooks/useCurrency'
import './CartTotals.css'

// Resumo financeiro do carrinho: subtotal, desconto (quando houver) e total,
// mais um aviso de quanto falta para ganhar o desconto.
export default function CartTotals({ totals, rules }) {
  const percent = Math.round(rules.discountRate * 100)
  const hasItems = totals.subtotal > 0

  return (
    <div className="cart-totals">
      <div className="cart-totals-row">
        <span>Subtotal</span>
        <span className="mono">{formatCurrency(totals.subtotal)}</span>
      </div>

      {totals.discount > 0 ? (
        <div className="cart-totals-row cart-totals-discount">
          <span>Desconto ({percent}%)</span>
          <span className="mono">− {formatCurrency(totals.discount)}</span>
        </div>
      ) : (
        hasItems && (
          <div className="cart-totals-hint">
            Faltam <strong className="mono">{formatCurrency(totals.missingForDiscount)}</strong> para ganhar{' '}
            {percent}% de desconto
          </div>
        )
      )}

      <div className="cart-total-row">
        <span>Total</span>
        <span className="cart-total mono">{formatCurrency(totals.total)}</span>
      </div>
    </div>
  )
}
