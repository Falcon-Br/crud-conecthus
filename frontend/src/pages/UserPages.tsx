import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, LockKeyhole, Pencil, UserRound } from 'lucide-react';
import { request, type User } from '../lib/api';
import { useResource } from '../lib/useResource';
import { UserForm } from '../components/UserForm';
import { ErrorState, Loading, useToast } from '../components/Feedback';

function useReturnTo() {
  const { state } = useLocation();
  return typeof state?.returnTo === 'string' && /^\/users(?:\?|$)/.test(state.returnTo)
    ? state.returnTo
    : '/users';
}
function PageHeading({
  title,
  subtitle,
  returnTo,
}: {
  title: string;
  subtitle: string;
  returnTo: string;
}) {
  return (
    <div className="page-heading">
      <div className="heading-with-back">
        <Link className="back-button" to={returnTo} aria-label="Voltar para usuários">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 tabIndex={-1}>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
export function CreateUserPage() {
  const returnTo = useReturnTo();
  const navigate = useNavigate();
  const toast = useToast();
  return (
    <>
      <PageHeading
        title="Cadastrar usuário"
        subtitle="Adicione um novo usuário ao sistema."
        returnTo={returnTo}
      />
      <UserForm
        cancelTo={returnTo}
        onSave={async (payload) => {
          await request<User>('/users', { method: 'POST', body: JSON.stringify(payload) });
          toast('Usuário cadastrado com sucesso.');
          navigate(returnTo);
        }}
      />
    </>
  );
}
export function EditUserPage() {
  const { id } = useParams();
  const returnTo = useReturnTo();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, error, loading, refresh } = useResource<User>(`/users/${id}`);
  return (
    <>
      <PageHeading
        title="Editar usuário"
        subtitle="Atualize as informações do usuário."
        returnTo={returnTo}
      />
      {loading ? (
        <div className="card">
          <Loading />
        </div>
      ) : error ? (
        <div className="card">
          <ErrorState message={error} retry={refresh} />
        </div>
      ) : (
        data && (
          <UserForm
            key={data.id}
            user={data}
            cancelTo={returnTo}
            onSave={async (payload) => {
              await request<User>(`/users/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(payload),
              });
              toast('Usuário atualizado com sucesso.');
              navigate(returnTo);
            }}
          />
        )
      )}
    </>
  );
}
export function ViewUserPage() {
  const { id } = useParams();
  const returnTo = useReturnTo();
  const { data, error, loading, refresh } = useResource<User>(`/users/${id}`);
  return (
    <>
      <PageHeading
        title="Visualizar usuário"
        subtitle="Consulte as informações do usuário."
        returnTo={returnTo}
      />
      {loading ? (
        <div className="card">
          <Loading />
        </div>
      ) : error ? (
        <div className="card">
          <ErrorState message={error} retry={refresh} />
        </div>
      ) : (
        data && (
          <section className="card user-details">
            <div className="detail-profile">
              <span className="detail-avatar">
                <UserRound size={30} />
              </span>
              <div>
                <h2>{data.name}</h2>
                <p>Usuário cadastrado</p>
              </div>
            </div>
            <div className="form-columns">
              <div>
                <h3 className="section-title">
                  <UserRound size={19} />
                  Dados do usuário
                </h3>
                <dl>
                  <div>
                    <dt>Nome</dt>
                    <dd>{data.name}</dd>
                  </div>
                  <div>
                    <dt>E-mail</dt>
                    <dd>{data.email}</dd>
                  </div>
                  <div>
                    <dt>Matrícula</dt>
                    <dd>{data.registration}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="section-title">
                  <LockKeyhole size={19} />
                  Dados de acesso
                </h3>
                <div className="info-note">
                  A senha é protegida e não pode ser visualizada. Para alterá-la, edite o usuário.
                </div>
                <dl>
                  <div>
                    <dt>Cadastrado em</dt>
                    <dd>{new Date(data.createdAt).toLocaleDateString('pt-BR')}</dd>
                  </div>
                  <div>
                    <dt>Última atualização</dt>
                    <dd>{new Date(data.updatedAt).toLocaleDateString('pt-BR')}</dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="form-footer">
              <Link className="button secondary" to={returnTo}>
                Voltar
              </Link>
              <Link className="button primary" to={`/users/${id}/edit`} state={{ returnTo }}>
                <Pencil size={17} />
                Editar usuário
              </Link>
            </div>
          </section>
        )
      )}
    </>
  );
}
