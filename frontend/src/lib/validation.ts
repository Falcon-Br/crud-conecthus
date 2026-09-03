import isEmail from 'validator/lib/isEmail';

export interface UserValues {
  name: string;
  email: string;
  registration: string;
  password: string;
  confirmation: string;
}
export type FieldErrors = Partial<Record<keyof UserValues, string>>;
export const emptyValues: UserValues = {
  name: '',
  email: '',
  registration: '',
  password: '',
  confirmation: '',
};
export function normalizeValues(values: UserValues): UserValues {
  return {
    ...values,
    name: values.name.normalize('NFC').trim().replace(/ +/g, ' '),
    email: values.email.trim().toLowerCase(),
  };
}
export function validateValues(input: UserValues, editing = false): FieldErrors {
  const values = normalizeValues(input);
  const errors: FieldErrors = {};
  if (!values.name) errors.name = 'Informe o nome do usuário.';
  else if (values.name.length > 30) errors.name = 'Use no máximo 30 caracteres.';
  else if (!/^\p{L}+(?: \p{L}+)*$/u.test(values.name))
    errors.name = 'Use apenas letras e espaços entre os nomes.';
  if (!values.email) errors.email = 'Informe o e-mail do usuário.';
  else if (values.email.length > 40) errors.email = 'Use no máximo 40 caracteres.';
  else if (!isEmail(values.email)) errors.email = 'Informe um e-mail válido.';
  if (!/^[0-9]{4,10}$/.test(values.registration))
    errors.registration = 'A matrícula deve ter de 4 a 10 números.';
  if (
    (!editing || values.password) &&
    !/^(?=.*[A-Za-z])(?=.*[0-9])[\x21-\x7e]{6}$/.test(values.password)
  ) {
    errors.password = 'Use 6 caracteres sem espaços, com ao menos uma letra e um número.';
  }
  if (values.password !== values.confirmation) errors.confirmation = 'As senhas devem ser iguais.';
  return errors;
}
export function userPayload(
  input: UserValues,
  original?: UserValues,
): Partial<Omit<UserValues, 'confirmation'>> {
  const values = normalizeValues(input);
  const previous = original && normalizeValues(original);
  const payload: Partial<Omit<UserValues, 'confirmation'>> = {};
  for (const key of ['name', 'email', 'registration'] as const) {
    if (!previous || values[key] !== previous[key]) payload[key] = values[key];
  }
  if (values.password) payload.password = values.password;
  return payload;
}
