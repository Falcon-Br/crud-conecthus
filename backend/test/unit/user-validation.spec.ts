import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { UpdateUserDto } from '../../src/users/dto/update-user.dto';

const valid = {
  name: 'João da Silva',
  email: 'joao@example.com',
  registration: '0012',
  password: 'Ab12!@',
};
const errorsFor = (input: object) =>
  validateSync(plainToInstance(CreateUserDto, input), { forbidUnknownValues: false });

describe('Regras de cadastro', () => {
  it('aceita nome acentuado, matrícula com zeros e senha com símbolos', () => {
    expect(errorsFor(valid)).toHaveLength(0);
  });
  it.each([
    ['name', 'João2'],
    ['name', '   '],
    ['name', 'a'.repeat(31)],
    ['name', 'João-Silva'],
    ['email', 'invalido'],
    ['email', 'a'.repeat(30) + '@example.com'],
    ['registration', '123'],
    ['registration', '12345678901'],
    ['registration', '12e3'],
    ['registration', 1234],
    ['registration', '1234\n'],
    ['password', 'Ab12!'],
    ['password', 'Ab123!@'],
    ['password', 'abcdef'],
    ['password', '123456'],
    ['password', 'Ab12 !'],
    ['password', 'Ab1\n!@'],
    ['password', 'Áb12!@'],
    ['password', 'Ab12!@\n'],
  ])('rejeita %s inválido: %s', (field, value) => {
    expect(errorsFor({ ...valid, [field]: value }).map((error) => error.property)).toContain(field);
  });
  it('exige todos os campos', () => {
    expect(
      errorsFor({})
        .map((error) => error.property)
        .sort(),
    ).toEqual(['email', 'name', 'password', 'registration']);
  });
  it('normaliza nome e email preservando a matrícula', () => {
    const dto = plainToInstance(CreateUserDto, {
      ...valid,
      name: '  Joa\u0303o   da Silva  ',
      email: ' JOAO@EXAMPLE.COM ',
    });
    expect(dto.name).toBe('João da Silva');
    expect(dto.email).toBe('joao@example.com');
    expect(dto.registration).toBe('0012');
  });
  it('aceita os limites superiores de nome e email', () => {
    expect(
      errorsFor({ ...valid, name: 'a'.repeat(30), email: 'a'.repeat(28) + '@example.com' }),
    ).toHaveLength(0);
  });
});

describe('Regras de edição', () => {
  it('permite omitir senha e transforma senha vazia em omissão', () => {
    const dto = plainToInstance(UpdateUserDto, { name: 'Maria', password: '' });
    expect(validateSync(dto, { forbidUnknownValues: false })).toHaveLength(0);
    expect(dto.password).toBeUndefined();
  });
  it.each(['name', 'email', 'registration', 'password'])('rejeita null em %s', (field) => {
    const dto = plainToInstance(UpdateUserDto, { [field]: null });
    expect(
      validateSync(dto, { forbidUnknownValues: false }).map((error) => error.property),
    ).toContain(field);
  });
  it('valida nova senha informada', () => {
    const dto = plainToInstance(UpdateUserDto, { password: '123456' });
    expect(
      validateSync(dto, { forbidUnknownValues: false }).map((error) => error.property),
    ).toContain('password');
  });
});
