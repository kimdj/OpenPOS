// Estado do carrinho, compartilhado entre o Caixa (PDV) e a Loja do Cliente.
// Respeita o estoque disponível: não deixa adicionar mais unidades do que há.
// (O back-end valida de novo no checkout — aqui é só para a experiência.)

import { useMemo, useState } from 'react'
import { calculateTotals } from '../utils/pricing'

export function useCart(rules) {
  const [cart, setCart] = useState([]) // [{ productId, name, price, category, qty, stock }]

  function qtyOf(productId) {
    return cart.find((i) => i.productId === productId)?.qty || 0
  }

  // Retorna false se não há estoque para mais uma unidade.
  function add(product) {
    const stock = product.stock ?? 0
    if (qtyOf(product._id) >= stock) return false

    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id)
      if (existing) {
        return prev.map((i) => (i.productId === product._id ? { ...i, qty: i.qty + 1, stock } : i))
      }
      return [
        ...prev,
        { productId: product._id, name: product.name, price: product.price, category: product.category, qty: 1, stock },
      ]
    })
    return true
  }

  function changeQty(productId, delta) {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, qty: Math.min(i.qty + delta, i.stock) } : i))
        .filter((i) => i.qty > 0)
    )
  }

  function remove(productId) {
    setCart((prev) => prev.filter((i) => i.productId !== productId))
  }

  function clear() {
    setCart([])
  }

  const totals = useMemo(() => calculateTotals(cart, rules), [cart, rules])

  return { cart, totals, qtyOf, add, changeQty, remove, clear }
}
