import { expect, test, type APIRequestContext } from '@playwright/test';

const api = '/api';
const createdIds: string[] = [];

async function createUser(request: APIRequestContext, name: string, index = 0) {
  const unique = String(Date.now() + index).slice(-10);
  const response = await request.post(`${api}/users`, {
    data: { name, email: `e${unique}@example.com`, registration: unique, password: 'Ab12!@' },
  });
  expect(response.status()).toBe(201);
  const user = await response.json();
  createdIds.push(user.id);
  return user;
}

test.afterEach(async ({ request }) => {
  for (const id of createdIds.splice(0)) await request.delete(`${api}/users/${id}`);
});

test('cadastro, busca, edição sem senha, visualização e exclusão', async ({ page, request }) => {
  const registration = String(Date.now()).slice(-10);
  await page.goto('/users/new');
  const save = page.getByRole('button', { name: 'Salvar', exact: true });
  await expect(save).toBeDisabled();
  await page.getByLabel('Nome', { exact: false }).fill('João Automação');
  await page.getByLabel('E-mail', { exact: false }).fill(`flow${registration}@example.com`);
  await page.getByLabel('Matrícula', { exact: false }).fill(registration);
  await page.getByLabel(/^Senha/).fill('Ab12!@');
  await page.getByLabel('Confirmar senha', { exact: false }).fill('Errad1');
  await expect(save).toBeDisabled();
  await page.getByLabel('Confirmar senha', { exact: false }).fill('Ab12!@');
  const createResponse = page.waitForResponse(
    (response) => response.url().endsWith('/api/users') && response.request().method() === 'POST',
  );
  await save.click();
  const created = await (await createResponse).json();
  createdIds.push(created.id);
  await expect(page).toHaveURL(/\/users$/);
  await page.getByRole('searchbox', { name: 'Buscar usuários por nome' }).fill('João Automação');
  await expect(page).toHaveURL((url) => url.searchParams.get('search') === 'João Automação');
  await expect(page.getByRole('row').filter({ hasText: 'João Automação' })).toBeVisible();
  await page.getByRole('link', { name: 'Editar João Automação', exact: true }).click();
  await expect(page.getByLabel('Nova senha', { exact: true })).toHaveValue('');
  await expect(save).toBeDisabled();
  await page.getByLabel('Nome', { exact: false }).fill('João Automação Editado');
  const updateRequest = page.waitForRequest((req) => req.method() === 'PATCH');
  await save.click();
  expect((await updateRequest).postDataJSON()).toEqual({ name: 'João Automação Editado' });
  await expect(
    page.getByRole('link', { name: 'Visualizar João Automação Editado', exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Visualizar João Automação Editado', exact: true }).click();
  await expect(page.getByText(registration, { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Voltar', exact: true }).click();
  await page.getByRole('button', { name: 'Excluir João Automação Editado', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Excluir usuário?' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Cancelar', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Excluir João Automação Editado', exact: true }),
  ).toBeFocused();
  await page.getByRole('button', { name: 'Excluir João Automação Editado', exact: true }).click();
  await dialog.getByRole('button', { name: 'Excluir usuário', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Nenhum usuário encontrado' })).toBeVisible();
  expect((await request.get(`${api}/users/${created.id}`)).status()).toBe(404);
});

test('duplicidade da API aparece no formulário e permite corrigir', async ({ page, request }) => {
  const existing = await createUser(request, 'Duplicidade Teste');
  await page.goto('/users/new');
  await page.getByLabel('Nome', { exact: false }).fill('Outro Usuário');
  await page.getByLabel('E-mail', { exact: false }).fill(existing.email);
  await page.getByLabel('Matrícula', { exact: false }).fill('000' + String(Date.now()).slice(-7));
  await page.getByLabel(/^Senha/).fill('Ab12!@');
  await page.getByLabel('Confirmar senha', { exact: false }).fill('Ab12!@');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Este email já está cadastrado.');
  await expect(page.getByLabel('E-mail', { exact: false })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Salvar', exact: true })).toBeDisabled();
  await page.getByLabel('E-mail', { exact: false }).fill('corrected@example.com');
  await expect(page.getByRole('button', { name: 'Salvar', exact: true })).toBeEnabled();
});

test('paginação real, busca volta à primeira página e falha de rede permite tentar novamente', async ({
  page,
  request,
}) => {
  for (let i = 0; i < 16; i++)
    await createUser(request, `Paginação ${String.fromCharCode(65 + i)}`, i);
  await page.goto('/users?search=Paginação');
  await expect(page.getByRole('row')).toHaveCount(16);
  await page.getByRole('button', { name: 'Próxima página' }).click();
  await expect(page.getByRole('row')).toHaveCount(2);
  await page.getByRole('searchbox', { name: 'Buscar usuários por nome' }).fill('Paginação A');
  await expect(page.getByRole('row').filter({ hasText: 'Paginação A' })).toBeVisible();
  await expect(page).toHaveURL(/page=1/);
  await page.route('**/api/users?*', (route) => route.abort());
  await page.reload();
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
  await page.unroute('**/api/users?*');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('row').filter({ hasText: 'Paginação A' })).toBeVisible();
});

test('interface utilizável em tela de celular', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/users/new');
  await expect(page.getByLabel('Nome', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Salvar', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('menu mobile devolve foco ao fechar e foca o título ao navegar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Abrir menu', exact: true });
  await menu.click();
  await expect(page.getByRole('button', { name: 'Fechar menu', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await menu.click();
  await page.getByRole('link', { name: 'Usuários', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Usuários', exact: true })).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
});
