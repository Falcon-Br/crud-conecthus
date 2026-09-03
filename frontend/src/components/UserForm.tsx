import { useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, Save, UserRound } from 'lucide-react';
import { ApiError, messageOf, type User } from '../lib/api';
import {
  emptyValues,
  userPayload,
  validateValues,
  type FieldErrors,
  type UserValues,
} from '../lib/validation';
export interface UserFormProps {
  user?: User;
  cancelTo: string;
  onSave: (payload: Partial<Omit<UserValues, 'confirmation'>>) => Promise<void>;
}
export function UserForm({ user, cancelTo, onSave }: UserFormProps) {
  const original: UserValues = {
    ...emptyValues,
    ...(user ? { name: user.name, email: user.email, registration: user.registration } : {}),
  };
  const [values, setValues] = useState(original);
  const [touched, setTouched] = useState<Partial<Record<keyof UserValues, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState('');
  const [pending, setPending] = useState(false);
  const [visible, setVisible] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const errors = validateValues(values, !!user);
  const payload = userPayload(values, user ? original : undefined);
  const canSave =
    !pending &&
    !Object.keys(errors).length &&
    !Object.values(serverErrors).some(Boolean) &&
    Object.keys(payload).length > 0;
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!canSave) return;
    setPending(true);
    setFailure('');
    try {
      await onSave(payload);
    } catch (error) {
      setFailure(messageOf(error));
      if (error instanceof ApiError) {
        const fields: FieldErrors = {};
        for (const field of Object.keys(emptyValues) as (keyof UserValues)[]) {
          if (error.errors[field]) fields[field] = error.errors[field].join(' ');
        }
        setServerErrors(fields);
        const first = Object.keys(fields)[0];
        if (first)
          requestAnimationFrame(() =>
            form.current?.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus(),
          );
      }
    } finally {
      setPending(false);
    }
  }
  function field(
    name: keyof UserValues,
    label: string,
    hint: string,
    placeholder: string,
    type = 'text',
  ) {
    const error = serverErrors[name] || (touched[name] ? errors[name] : undefined);
    const password = name === 'password' || name === 'confirmation';
    return (
      <div className="field" key={name}>
        <label htmlFor={name}>
          {label}
          {(!user || !password) && (
            <span className="required" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
        <div className="input-wrap">
          <input
            id={name}
            name={name}
            value={values[name]}
            placeholder={placeholder}
            type={password ? (visible ? 'text' : 'password') : type}
            inputMode={name === 'registration' ? 'numeric' : undefined}
            autoComplete={
              password
                ? 'new-password'
                : name === 'name'
                  ? 'name'
                  : name === 'email'
                    ? 'email'
                    : 'off'
            }
            required={!user || !password}
            disabled={pending}
            aria-invalid={!!error}
            aria-describedby={`${name}-hint${error ? ` ${name}-error` : ''}`}
            onBlur={() => setTouched((previous) => ({ ...previous, [name]: true }))}
            onChange={(event) => {
              setValues((previous) => ({ ...previous, [name]: event.target.value }));
              setServerErrors((previous) => ({ ...previous, [name]: undefined }));
              setFailure('');
            }}
          />
          {name === 'password' && (
            <button
              type="button"
              className="password-toggle"
              aria-label={visible ? 'Ocultar senhas' : 'Mostrar senhas'}
              onClick={() => setVisible(!visible)}
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        <small id={`${name}-hint`} className="field-hint">
          {hint}
        </small>
        {error && (
          <span id={`${name}-error`} className="field-error">
            {error}
          </span>
        )}
      </div>
    );
  }
  return (
    <form ref={form} className="card user-form" noValidate onSubmit={submit} aria-busy={pending}>
      <div className="form-intro">
        <span>Preencha as informações abaixo.</span>
        <small>
          <span className="required">*</span> Campos obrigatórios
        </small>
      </div>
      <div className="form-sections">
        <fieldset>
          <legend>
            <UserRound size={19} /> Dados do usuário
          </legend>
          <div className="fields-grid">
            {field(
              'name',
              'Nome',
              'Até 30 caracteres. Use apenas letras e espaços.',
              'Digite o nome completo',
            )}
            {field('registration', 'Matrícula', 'De 4 a 10 números.', 'Digite a matrícula')}
            {field('email', 'E-mail', 'Até 40 caracteres.', 'Digite o e-mail', 'email')}
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <LockKeyhole size={19} /> Dados de acesso
          </legend>
          {user && (
            <div className="info-note">
              Para manter a senha atual, deixe os dois campos abaixo em branco.
            </div>
          )}
          <div className="fields-grid">
            {field(
              'password',
              user ? 'Nova senha' : 'Senha',
              'Exatamente 6 caracteres, com letra e número, sem espaços. Símbolos são opcionais.',
              'Digite a senha',
            )}
            {field(
              'confirmation',
              'Confirmar senha',
              'Repita a senha informada.',
              'Confirme a senha',
            )}
          </div>
        </fieldset>
      </div>
      {failure && (
        <div className="alert error" role="alert">
          {failure}
        </div>
      )}
      <div className="form-footer">
        <Link
          className={`button secondary${pending ? ' link-disabled' : ''}`}
          to={cancelTo}
          aria-disabled={pending}
          onClick={(event) => {
            if (pending) event.preventDefault();
          }}
        >
          Cancelar
        </Link>
        <button className="button primary" type="submit" disabled={!canSave}>
          <Save size={17} />
          {pending ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
