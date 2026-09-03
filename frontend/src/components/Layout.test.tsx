import { StrictMode } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { Layout } from './Layout';

// jsdom ignores inert for focus. Reproduce the browser's restriction so this
// regression fails when focus runs before React removes the inert attribute.
beforeEach(() => {
  const nativeFocus = HTMLElement.prototype.focus;
  vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(function (
    this: HTMLElement,
    options,
  ) {
    if (!this.closest('[inert]')) nativeFocus.call(this, options);
  });
});

function renderLayout() {
  render(
    <StrictMode>
      <MemoryRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<h1 tabIndex={-1}>Home</h1>} />
            <Route path="users" element={<h1 tabIndex={-1}>Usuários</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </StrictMode>,
  );
}

it.each(['Escape', 'button', 'backdrop'])(
  'returns focus to the menu trigger after removing inert when dismissed via %s',
  async (method) => {
    const actor = userEvent.setup();
    renderLayout();
    const trigger = screen.getByRole('button', { name: 'Abrir menu' });
    await actor.click(trigger);
    expect(screen.getByRole('button', { name: 'Fechar menu' })).toHaveFocus();
    if (method === 'Escape') await actor.keyboard('{Escape}');
    else if (method === 'button')
      await actor.click(screen.getByRole('button', { name: 'Fechar menu' }));
    else fireEvent.click(document.querySelector('.sidebar-backdrop')!);
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
);

it('focuses the destination heading after menu navigation and closes on the current nav item', async () => {
  const actor = userEvent.setup();
  renderLayout();
  const trigger = screen.getByRole('button', { name: 'Abrir menu' });
  await actor.click(trigger);
  await actor.click(
    within(screen.getByRole('navigation', { name: 'Navegação principal' })).getByRole('link', {
      name: 'Usuários',
    }),
  );
  expect(screen.getByRole('heading', { name: 'Usuários' })).toHaveFocus();
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await actor.click(trigger);
  await actor.click(
    within(screen.getByRole('navigation', { name: 'Navegação principal' })).getByRole('link', {
      name: 'Usuários',
    }),
  );
  expect(screen.getByRole('heading', { name: 'Usuários' })).toHaveFocus();
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});
