import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { UserForm } from './UserForm';
import { ApiError, type User } from '../lib/api';
const existing: User = {
  id: '123',
  name: 'João Silva',
  email: 'joao@example.com',
  registration: '0012',
  createdAt: '2026-09-02T12:00:00.000Z',
  updatedAt: '2026-09-02T12:00:00.000Z',
};
describe('UserForm', () => {
  it('prevents submit until required values and matching confirmation are valid', async () => {
    const actor = userEvent.setup();
    const saved = vi.fn().mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <UserForm cancelTo="/users" onSave={saved} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    await actor.type(screen.getByLabelText(/^Nome/), 'Maria Silva');
    await actor.type(screen.getByLabelText(/^E-mail/), 'MARIA@example.com');
    await actor.type(screen.getByLabelText(/^Matrícula/), '0001');
    await actor.type(screen.getByLabelText(/^Senha/), 'Abc12!');
    await actor.type(screen.getByLabelText(/^Confirmar senha/), 'Abc13!');
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    await actor.clear(screen.getByLabelText(/^Confirmar senha/));
    await actor.type(screen.getByLabelText(/^Confirmar senha/), 'Abc12!');
    await actor.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(saved).toHaveBeenCalledWith({
      name: 'Maria Silva',
      email: 'maria@example.com',
      registration: '0001',
      password: 'Abc12!',
    });
  });
  it('disables unchanged edits and saves a name change with no password', async () => {
    const actor = userEvent.setup();
    const saved = vi.fn().mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <UserForm user={existing} cancelTo="/users" onSave={saved} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    await actor.clear(screen.getByLabelText(/^Nome/));
    await actor.type(screen.getByLabelText(/^Nome/), 'Maria Silva');
    await actor.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(saved).toHaveBeenCalledWith({ name: 'Maria Silva' });
  });
  it.each(['joão@example.com', '"ana"@example.com'])(
    'allows a name-only update while preserving the API-accepted email %s',
    async (email) => {
      const actor = userEvent.setup();
      const saved = vi.fn().mockResolvedValue(undefined);
      render(
        <MemoryRouter>
          <UserForm user={{ ...existing, email }} cancelTo="/users" onSave={saved} />
        </MemoryRouter>,
      );
      await actor.clear(screen.getByLabelText(/^Nome/));
      await actor.type(screen.getByLabelText(/^Nome/), 'Maria Silva');
      expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled();
      await actor.click(screen.getByRole('button', { name: 'Salvar' }));
      expect(saved).toHaveBeenCalledWith({ name: 'Maria Silva' });
      expect(screen.getByLabelText(/^E-mail/)).toHaveValue(email);
    },
  );
  it('associates duplicate errors with the field and permits correction', async () => {
    const actor = userEvent.setup();
    const saved = vi.fn().mockRejectedValue(
      new ApiError(409, 'Já existe um usuário com este e-mail.', {
        email: ['E-mail já cadastrado.'],
      }),
    );
    render(
      <MemoryRouter>
        <UserForm user={existing} cancelTo="/users" onSave={saved} />
      </MemoryRouter>,
    );
    await actor.clear(screen.getByLabelText(/^E-mail/));
    await actor.type(screen.getByLabelText(/^E-mail/), 'other@example.com');
    await actor.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() =>
      expect(screen.getByLabelText(/^E-mail/)).toHaveAttribute('aria-invalid', 'true'),
    );
    expect(screen.getByLabelText(/^E-mail/)).toHaveAccessibleDescription(/E-mail já cadastrado/);
    await actor.clear(screen.getByLabelText(/^E-mail/));
    await actor.type(screen.getByLabelText(/^E-mail/), 'unique@example.com');
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled();
  });
});
