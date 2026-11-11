import { useEffect } from 'react';
import { IconAlert } from './Icons';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  loading = false,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-mask" onClick={onCancel} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-icon">
          <IconAlert />
        </div>
        <h3 id="confirm-title">{title}</h3>
        {description && <p>{description}</p>}
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner light" /> : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
