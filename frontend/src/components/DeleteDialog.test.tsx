import { StrictMode, useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { DeleteDialog } from './DeleteDialog';
import type { User } from '../lib/api';

const user: User = {
  id: '123',
  name: 'João Silva',
  email: 'joao@example.com',
  registration: '0012',
  createdAt: '2026-09-02T12:00:00.000Z',
  updatedAt: '2026-09-02T12:00:00.000Z',
};

// jsdom has no dialog methods or top layer. Model only the native opening
// behavior here; the real browser E2E additionally verifies the focus trap.
beforeEach(() => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.open = true;
        this.querySelector<HTMLButtonElement>('button')?.focus();
      },
    },
    close: {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.open = false;
      },
    },
  });
});
afterEach(() => {
  cleanup();
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
});

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Excluir João Silva</button>
      {open && (
        <DeleteDialog user={user} onClose={() => setOpen(false)} onDeleted={() => setOpen(false)} />
      )}
    </>
  );
}

it('focuses Cancelar after modal opening in StrictMode and returns focus on Escape', async () => {
  const actor = userEvent.setup();
  render(
    <StrictMode>
      <Harness />
    </StrictMode>,
  );
  const trigger = screen.getByRole('button', { name: 'Excluir João Silva' });
  await actor.click(trigger);
  expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
