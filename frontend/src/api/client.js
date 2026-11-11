// Cliente de API centralizado. Toda comunicação com o back-end Express
// passa por aqui, então cada tela não precisa repetir tratamento de erro,
// headers ou lógica de "cookie de sessão" (credentials: 'include').

const BASE = '/api'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (res.status === 401) {
    throw new ApiError('not_authenticated', 401)
  }

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    throw new ApiError(data?.error || 'Something went wrong', res.status)
  }

  return data
}

export const api = {
  me: () => request('/me'),
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (payload) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/auth/logout', { method: 'POST' }),

  getProducts: (search = '') =>
    request(`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createProduct: (product) =>
    request('/products', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (id, product) =>
    request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  deleteProduct: (id) =>
    request(`/products/${id}`, { method: 'DELETE' }),

  getSales: () => request('/sales'),
  // Só envia id + quantidade: preço, desconto e total são calculados no servidor.
  createSale: (items) =>
    request('/sales', { method: 'POST', body: JSON.stringify({ items: toOrderItems(items) }) }),

  getStats: () => request('/stats'),

  // -------- Loja do cliente (rotas públicas, sem login) --------
  getPricingRules: () => request('/public/regras'),
  getStore: (username) => request(`/public/lojas/${encodeURIComponent(username)}/produtos`),
  buyFromStore: (username, items) =>
    request(`/public/lojas/${encodeURIComponent(username)}/compras`, {
      method: 'POST',
      body: JSON.stringify({ items: toOrderItems(items) }),
    }),
}

function toOrderItems(items) {
  return items.map((item) => ({ productId: item.productId, qty: item.qty }))
}

export { ApiError }
