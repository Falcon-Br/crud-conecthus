import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, X } from 'lucide-react';
import { messageOf, request, type User } from '../lib/api';
export function DeleteDialog({
  user,
  onClose,
  onDeleted,
}: {
  user: User;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    element?.showModal();
    cancelButton.current?.focus();
    return () => {
      element?.close();
      if (previousFocus?.isConnected) previousFocus.focus();
      else document.querySelector<HTMLElement>('#user-search')?.focus();
    };
  }, []);
  async function remove() {
    setPending(true);
    setError('');
    try {
      await request<void>(`/users/${user.id}`, { method: 'DELETE' });
      onDeleted();
    } catch (failure) {
      setError(messageOf(failure));
      setPending(false);
    }
  }
  return createPortal(
    <dialog
      ref={dialog}
      className="delete-dialog"
      aria-labelledby="delete-title"
      aria-describedby="delete-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onClose();
      }}
    >
      <button
        className="icon-button modal-close"
        onClick={onClose}
        disabled={pending}
        aria-label="Fechar confirmação"
      >
        <X size={20} />
      </button>
      <div className="delete-symbol">
        <Trash2 size={26} />
      </div>
      <h2 id="delete-title">Excluir usuário?</h2>
      <p id="delete-description">
        Você está prestes a excluir <strong>{user.name}</strong>. Esta ação não pode ser desfeita.
      </p>
      {error && (
        <p className="alert error" role="alert">
          {error}
        </p>
      )}
      <div className="dialog-actions">
        <button
          ref={cancelButton}
          className="button secondary"
          onClick={onClose}
          disabled={pending}
        >
          Cancelar
        </button>
        <button className="button danger" onClick={remove} disabled={pending}>
          {pending ? 'Excluindo…' : 'Excluir usuário'}
        </button>
      </div>
    </dialog>,
    document.body,
  );
}
