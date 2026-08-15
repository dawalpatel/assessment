import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = '540px' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header" style={{ marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 className="card-title" style={{ fontSize: '1.25rem' }}>{title}</h3>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ padding: '0.4rem', borderRadius: '50%', width: '32px', height: '32px' }}
          >
            <X size={18} />
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
