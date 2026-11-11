// PRÉVIA da regra de desconto, só para exibir no carrinho antes de finalizar.
// O valor que vale é sempre o devolvido pelo back-end (services/pricing.js).
// Os parâmetros (limite e percentual) vêm da API em /api/public/regras, então
// se o professor mudar a regra, só o back-end precisa ser alterado.

import { useEffect, useState } from 'react'
import { api } from '../api/client'

export const DEFAULT_RULES = { discountThreshold: 200, discountRate: 0.05 }

const toCents = (v) => Math.round(Number(v) * 100)

export function calculateTotals(items, rules = DEFAULT_RULES) {
  const subtotalCents = items.reduce((sum, i) => sum + toCents(i.price) * i.qty, 0)
  const hasDiscount = subtotalCents > toCents(rules.discountThreshold)
  const discountCents = hasDiscount ? Math.round(subtotalCents * rules.discountRate) : 0
  const missingCents = hasDiscount ? 0 : toCents(rules.discountThreshold) - subtotalCents + 1

  return {
    subtotal: subtotalCents / 100,
    discount: discountCents / 100,
    discountRate: hasDiscount ? rules.discountRate : 0,
    total: (subtotalCents - discountCents) / 100,
    missingForDiscount: missingCents / 100, // quanto falta para ganhar o desconto
  }
}

export function usePricingRules() {
  const [rules, setRules] = useState(DEFAULT_RULES)
  useEffect(() => {
    api.getPricingRules().then(setRules).catch(() => {})
  }, [])
  return rules
}
