import { describe, expect, it } from 'vitest';
import { normalizeValues, userPayload, validateValues, type UserValues } from './validation';

const valid: UserValues = {
  name: 'João Silva',
  email: 'joao@example.com',
  registration: '0012',
  password: 'Abc12!',
  confirmation: 'Abc12!',
};
describe('user form rules', () => {
  it('normalizes names and email while preserving leading registration zeroes', () => {
    expect(
      normalizeValues({ ...valid, name: '  Joa\u0303o   Silva  ', email: '  JOAO@EXAMPLE.COM ' }),
    ).toEqual(valid);
  });
  it.each(['', 'Ana 2', 'Ana-Silva', 'Ana\tSilva', 'Ana\nSilva', 'a'.repeat(31)])(
    'rejects invalid name %s',
    (name) => {
      expect(validateValues({ ...valid, name }).name).toBeTruthy();
    },
  );
  it.each(['', 'invalid', `${'a'.repeat(31)}@gmail.com`])(
    'rejects invalid or oversized email %s',
    (email) => {
      expect(validateValues({ ...valid, email }).email).toBeTruthy();
    },
  );
  it.each(['joão@example.com', '"ana"@example.com'])(
    'accepts the same valid email as the API: %s',
    (email) => {
      expect(validateValues({ ...valid, email })).toEqual({});
    },
  );
  it.each(['123', '12345678901', 'ab12', '１２３４', '1234\n'])(
    'rejects invalid registration %s',
    (registration) => {
      expect(validateValues({ ...valid, registration }).registration).toBeTruthy();
    },
  );
  it.each(['abcde', 'abc1234', 'abcdef', '123456', 'abc 12', 'ábcd12', 'Ab12!@\n'])(
    'rejects invalid password %s',
    (password) => {
      expect(validateValues({ ...valid, password, confirmation: password }).password).toBeTruthy();
    },
  );
  it.each(['abc123', 'Abc12!', '!a1@#$'])('accepts optional symbols in password %s', (password) => {
    expect(validateValues({ ...valid, password, confirmation: password })).toEqual({});
  });
  it('rejects mismatched confirmation', () => {
    expect(validateValues({ ...valid, confirmation: 'abc123' }).confirmation).toBeTruthy();
  });
  it('allows editing without changing password and submits only changed fields', () => {
    const original = { ...valid, password: '', confirmation: '' };
    const values = { ...original, name: 'Maria Silva' };
    expect(validateValues(values, true)).toEqual({});
    expect(userPayload(values, original)).toEqual({ name: 'Maria Silva' });
    expect(userPayload(original, original)).toEqual({});
  });
  it('does not submit confirmation when creating a user', () => {
    expect(userPayload(valid)).toEqual({
      name: 'João Silva',
      email: 'joao@example.com',
      registration: '0012',
      password: 'Abc12!',
    });
  });
  it('rejects confirmation by itself on edit', () => {
    expect(validateValues({ ...valid, password: '' }, true).confirmation).toBeTruthy();
  });
});
