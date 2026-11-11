import './ConfirmDialog.css'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmar', danger, onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-card" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="dialog-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
