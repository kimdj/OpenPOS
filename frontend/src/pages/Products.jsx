import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'
import { useDebounce } from '../hooks/useDebounce'
import { formatCurrency } from '../hooks/useCurrency'
import ConfirmDialog from '../components/ConfirmDialog'
import ProductFormModal from '../components/ProductFormModal'
import './Products.css'

const CATEGORY_LABELS = { Foods: 'Comidas', Drinks: 'Bebidas', Other: 'Outros' }

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const { push } = useToast()

  useEffect(() => {
    loadProducts(debouncedSearch)
  }, [debouncedSearch])

  async function loadProducts(searchTerm) {
    setLoading(true)
    try {
      const data = await api.getProducts(searchTerm)
      setProducts(data)
    } catch {
      push('Não foi possível carregar os produtos.', 'error')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingProduct(null)
    setFormOpen(true)
  }

  function openEdit(product) {
    setEditingProduct(product)
    setFormOpen(true)
  }

  async function handleSave(values) {
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct._id, values)
        push('Produto atualizado.', 'success')
      } else {
        await api.createProduct(values)
        push('Produto criado.', 'success')
      }
      setFormOpen(false)
      loadProducts(debouncedSearch)
    } catch (err) {
      push(err.message || 'Erro ao salvar produto.', 'error')
      throw err
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.deleteProduct(deleteTarget._id)
      push('Produto removido.', 'success')
      setDeleteTarget(null)
      loadProducts(debouncedSearch)
    } catch {
      push('Não foi possível remover o produto.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Produtos</h1>
          <p className="page-subtitle">Cadastro de produtos e controle de estoque</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <IconPlus /> Novo produto
        </button>
      </div>

      <div className="products-toolbar">
        <div className="field search-input">
          <IconSearch />
          <input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="spinner" />
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <IconBox />
          <div className="empty-state-title">
            {search ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
          </div>
          <p>{search ? 'Tente outro termo de busca.' : 'Cadastre o primeiro produto do mercado.'}</p>
        </div>
      ) : (
        <div className="card products-table-wrap">
          <table className="products-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>
                    <span className={`badge badge-${p.category.toLowerCase()}`}>
                      {CATEGORY_LABELS[p.category]}
                    </span>
                  </td>
                  <td className="mono">{formatCurrency(p.price)}</td>
                  <td>
                    <span className={`stock-badge${!p.stock ? ' empty' : p.stock <= 5 ? ' low' : ''}`}>
                      {!p.stock ? 'Esgotado' : `${p.stock} un.`}
                    </span>
                  </td>
                  <td className="products-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>
                      Editar
                    </button>
                    <button
                      className="btn btn-ghost btn-sm danger-hover"
                      onClick={() => setDeleteTarget(p)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormModal
        open={formOpen}
        product={editingProduct}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir produto"
        message={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Essa ação não pode ser desfeita.`}
        confirmLabel={deleting ? 'Excluindo...' : 'Excluir'}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  )
}
function IconBox() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 8 12 3 3 8l9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" />
    </svg>
  )
}
