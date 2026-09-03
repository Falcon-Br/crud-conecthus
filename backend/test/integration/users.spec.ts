import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { configureApplication } from '../../src/configure-application';
import { databaseOptions } from '../../src/database/options';

const TEST_DATABASE_URL = 'postgresql://wenlock:wenlock_test@127.0.0.1:54330/wenlock_test';
const base = {
  name: 'João da Silva',
  email: 'joao@example.com',
  registration: '001234',
  password: 'Ab12!@',
};

describe('API de usuários com PostgreSQL real', () => {
  let app: INestApplication;
  let db: DataSource;
  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    process.env.NODE_ENV = 'test';
    db = await new DataSource(databaseOptions()).initialize();
    await db.runMigrations();
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication({ bodyParser: false });
    configureApplication(app);
    await app.init();
  });
  beforeEach(async () => {
    // This connection is intentionally fixed to the disposable database on port 54330.
    const [row] = await db.query("SELECT to_regclass('public.users') AS table_name");
    if (row.table_name) await db.query('TRUNCATE TABLE users');
  });
  afterAll(async () => {
    await app?.close();
    await db?.destroy();
  });

  it('cria, normaliza, persiste hash com salt e nunca expõe senha/hash', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/users')
      .send({ ...base, name: '  João   da Silva ', email: ' JOAO@EXAMPLE.COM ' })
      .expect(201);
    expect(created.body).toEqual({
      id: expect.any(String),
      name: 'João da Silva',
      email: 'joao@example.com',
      registration: '001234',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    const [stored] = await db.query('SELECT password_hash FROM users WHERE id = $1', [
      created.body.id,
    ]);
    expect(stored.password_hash).toMatch(/^scrypt\$/);
    expect(stored.password_hash).not.toContain(base.password);
    const second = await request(app.getHttpServer())
      .post('/api/users')
      .send({ ...base, email: 'other@example.com', registration: '001235' })
      .expect(201);
    const [storedSecond] = await db.query('SELECT password_hash FROM users WHERE id = $1', [
      second.body.id,
    ]);
    expect(storedSecond.password_hash).not.toBe(stored.password_hash);
    const read = await request(app.getHttpServer())
      .get('/api/users/' + created.body.id)
      .expect(200);
    expect(read.body).toEqual(created.body);
  });

  it('rejeita payload inválido e propriedades extras sem devolver a senha', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send({ ...base, name: '123', password: 'senha-invalida', role: 'admin' })
      .expect(400);
    expect(response.body.errors).toHaveProperty('name');
    expect(response.body.errors).toHaveProperty('password');
    expect(response.body.errors).toHaveProperty('role');
    expect(JSON.stringify(response.body)).not.toContain('senha-invalida');
  });

  it('rejeita JSON malformado sem expor o trecho enviado', async () => {
    const password = 'Ab12!@';
    const response = await request(app.getHttpServer())
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send(`{"password":${password}}`)
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      code: 'MALFORMED_JSON',
      message: 'O corpo da requisição contém JSON inválido.',
    });
    expect(JSON.stringify(response.body)).not.toContain(password);
  });

  it.each([
    ['JSON truncado', '{"password":"Ab12!@"'],
    ['vírgula final', '{"password":"Ab12!@",}'],
    ['escape Unicode inválido', '{"password":"Ab12!@\\uZZZZ"}'],
  ])('rejeita %s sem expor o trecho enviado', async (_description, body) => {
    const response = await request(app.getHttpServer())
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      code: 'MALFORMED_JSON',
      message: 'O corpo da requisição contém JSON inválido.',
    });
    expect(JSON.stringify(response.body)).not.toContain('Ab12!@');
  });

  it('rejeita corpo maior que 16 KB sem expor o payload', async () => {
    const password = `Ab12!@${'x'.repeat(17 * 1024)}`;
    const response = await request(app.getHttpServer())
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ password }));

    expect(response.body).toEqual({
      statusCode: 413,
      code: 'PAYLOAD_TOO_LARGE',
      message: 'O corpo da requisição excede o limite permitido.',
    });
    expect(response.status).toBe(413);
    expect(JSON.stringify(response.body)).not.toContain(password);
  });

  it('garante email único mesmo em duas criações concorrentes', async () => {
    const responses = await Promise.all([
      request(app.getHttpServer()).post('/api/users').send(base),
      request(app.getHttpServer())
        .post('/api/users')
        .send({ ...base, email: 'JOAO@example.com', registration: '009999' }),
    ]);
    expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
    expect(responses.find((response) => response.status === 409)?.body.errors).toHaveProperty(
      'email',
    );
  });

  it('garante matrícula única', async () => {
    await request(app.getHttpServer()).post('/api/users').send(base).expect(201);
    const conflict = await request(app.getHttpServer())
      .post('/api/users')
      .send({ ...base, email: 'outro@example.com' })
      .expect(409);
    expect(conflict.body.errors).toHaveProperty('registration');
  });

  it('edita dados mantendo a senha omitida ou vazia; troca somente se informada', async () => {
    const created = await request(app.getHttpServer()).post('/api/users').send(base).expect(201);
    const id = created.body.id;
    const hash = async () =>
      (await db.query('SELECT password_hash FROM users WHERE id = $1', [id]))[0].password_hash;
    const original = await hash();
    await request(app.getHttpServer())
      .patch('/api/users/' + id)
      .send({ name: 'Maria da Silva' })
      .expect(200);
    expect(await hash()).toBe(original);
    await request(app.getHttpServer())
      .patch('/api/users/' + id)
      .send({ name: 'Maria Silva', password: '' })
      .expect(200);
    expect(await hash()).toBe(original);
    const changed = await request(app.getHttpServer())
      .patch('/api/users/' + id)
      .send({ password: 'Cd34!@' })
      .expect(200);
    expect(await hash()).not.toBe(original);
    expect(changed.body).not.toHaveProperty('passwordHash');
    await request(app.getHttpServer())
      .patch('/api/users/' + id)
      .send({ password: null })
      .expect(400);
    await request(app.getHttpServer())
      .patch('/api/users/' + id)
      .send({})
      .expect(400);
  });

  it('não altera o usuário quando edição gera conflito', async () => {
    await request(app.getHttpServer()).post('/api/users').send(base).expect(201);
    const second = await request(app.getHttpServer())
      .post('/api/users')
      .send({ ...base, name: 'Maria', email: 'maria@example.com', registration: '7777' })
      .expect(201);
    await request(app.getHttpServer())
      .patch('/api/users/' + second.body.id)
      .send({ name: 'Mudança', email: base.email })
      .expect(409);
    const read = await request(app.getHttpServer())
      .get('/api/users/' + second.body.id)
      .expect(200);
    expect(read.body.name).toBe('Maria');
  });

  it('pesquisa por trecho sem distinguir caixa, pagina e ajusta página além do total', async () => {
    for (const [index, name] of ['João Almeida', 'João Barros', 'Maria Silva'].entries()) {
      await request(app.getHttpServer())
        .post('/api/users')
        .send({ ...base, name, email: `user${index}@example.com`, registration: `000${index}` })
        .expect(201);
    }
    const page = await request(app.getHttpServer())
      .get('/api/users')
      .query({ search: 'JOÃO', page: 2, pageSize: 1 })
      .expect(200);
    expect(page.body.data.map((user: { name: string }) => user.name)).toEqual(['João Barros']);
    expect(page.body.meta).toEqual({ page: 2, pageSize: 1, total: 2, totalPages: 2 });
    expect(JSON.stringify(page.body)).not.toMatch(/password|scrypt/);
    const adjusted = await request(app.getHttpServer())
      .get('/api/users?page=99&pageSize=2')
      .expect(200);
    expect(adjusted.body.meta.page).toBe(2);
    const noResults = await request(app.getHttpServer()).get('/api/users?search=%25').expect(200);
    expect(noResults.body).toEqual({
      data: [],
      meta: { page: 1, pageSize: 15, total: 0, totalPages: 0 },
    });
  });

  it.each([
    'page=0',
    'page=-1',
    'page=abc',
    'pageSize=101',
    'pageSize=1.5',
    'page=1e2',
    'page=9999999999999999',
  ])('rejeita paginação inválida: %s', async (query) => {
    await request(app.getHttpServer())
      .get('/api/users?' + query)
      .expect(400);
  });

  it('exclui e distingue identificador inválido de usuário inexistente', async () => {
    await request(app.getHttpServer()).get('/api/users/invalid').expect(400);
    await request(app.getHttpServer())
      .get('/api/users/00000000-0000-4000-8000-000000000001')
      .expect(404);
    const created = await request(app.getHttpServer()).post('/api/users').send(base).expect(201);
    await request(app.getHttpServer())
      .delete('/api/users/' + created.body.id)
      .expect(204);
    await request(app.getHttpServer())
      .get('/api/users/' + created.body.id)
      .expect(404);
    await request(app.getHttpServer())
      .delete('/api/users/' + created.body.id)
      .expect(404);
  });
});
