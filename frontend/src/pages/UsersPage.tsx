import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { type User, type UserList } from '../lib/api';
import { useResource } from '../lib/useResource';
import { DeleteDialog } from '../components/DeleteDialog';
import { ErrorState, Loading, useToast } from '../components/Feedback';

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}
export function UsersPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const page = positiveInteger(params.get('page'), 1);
  const requestedSize = positiveInteger(params.get('pageSize'), 15);
  const pageSize = [15, 30, 50, 100].includes(requestedSize) ? requestedSize : 15;
  const [draft, setDraft] = useState(search);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [deleting, setDeleting] = useState<User>();
  const toast = useToast();
  const query = new URLSearchParams({ search, page: String(page), pageSize: String(pageSize) });
  const { data, error, loading, refresh } = useResource<UserList>(`/users?${query}`);
  useEffect(() => {
    setDraft(search);
    clearTimeout(timer.current);
  }, [search]);
  useEffect(() => () => clearTimeout(timer.current), []);
  function update(values: Record<string, string>) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        for (const [key, value] of Object.entries(values)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        return next;
      },
      { replace: true },
    );
  }
  function searchChanged(value: string) {
    setDraft(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => update({ search: value, page: '1' }), 300);
  }
  const shownPage = data?.meta.page || page;
  const returnTo = `/users${params.size ? `?${params}` : ''}`;
  const navigationState = { returnTo };
  return (
    <>
      <div className="page-heading">
        <div>
          <h1 tabIndex={-1}>Usuários</h1>
          <p>Gerencie os usuários cadastrados no sistema.</p>
        </div>
        <Link className="button primary" to="/users/new" state={navigationState}>
          <Plus size={18} />
          Cadastrar usuário
        </Link>
      </div>
      <section className="card users-card" aria-label="Usuários cadastrados">
        <div className="table-toolbar">
          <div>
            <h2>Lista de usuários</h2>
            {data && !loading && <span className="count-badge">{data.meta.total}</span>}
          </div>
          <div className="search-field">
            <Search size={18} />
            <label className="sr-only" htmlFor="user-search">
              Buscar usuários por nome
            </label>
            <input
              id="user-search"
              type="search"
              placeholder="Buscar por nome"
              value={draft}
              onChange={(event) => searchChanged(event.target.value)}
            />
            {draft && (
              <button
                aria-label="Limpar busca"
                className="icon-button"
                onClick={() => searchChanged('')}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <Loading label="Carregando usuários…" />
        ) : error ? (
          <ErrorState message={error} retry={refresh} />
        ) : !data?.data.length ? (
          <div className="state-panel empty-state">
            <span className="empty-icon">
              <Users size={30} />
            </span>
            <h2>{search ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}</h2>
            <p>
              {search
                ? 'Tente buscar por outro nome ou limpe a busca.'
                : 'Cadastre o primeiro usuário para começar.'}
            </p>
            {search ? (
              <button className="button secondary" onClick={() => searchChanged('')}>
                Limpar busca
              </button>
            ) : (
              <Link className="button primary" to="/users/new" state={navigationState}>
                <Plus size={17} />
                Cadastrar usuário
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <caption className="sr-only">
                  Lista de usuários com ações para visualizar, editar e excluir
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Nome</th>
                    <th scope="col" className="actions-heading">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <span className="user-name">{user.name}</span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <Link
                            className="icon-button view-action"
                            to={`/users/${user.id}`}
                            state={navigationState}
                            aria-label={`Visualizar ${user.name}`}
                            title="Visualizar"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            className="icon-button edit-action"
                            to={`/users/${user.id}/edit`}
                            state={navigationState}
                            aria-label={`Editar ${user.name}`}
                            title="Editar"
                          >
                            <Pencil size={17} />
                          </Link>
                          <button
                            className="icon-button delete-action"
                            aria-label={`Excluir ${user.name}`}
                            title="Excluir"
                            onClick={() => setDeleting(user)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <div className="page-size">
                <label htmlFor="page-size">Itens por página</label>
                <select
                  id="page-size"
                  value={pageSize}
                  onChange={(event) => update({ pageSize: event.target.value, page: '1' })}
                >
                  {[15, 30, 50, 100].map((size) => (
                    <option key={size}>{size}</option>
                  ))}
                </select>
              </div>
              <div className="page-controls">
                <span>
                  {(shownPage - 1) * pageSize + 1}–{Math.min(shownPage * pageSize, data.meta.total)}{' '}
                  de {data.meta.total}
                </span>
                <button
                  className="icon-button"
                  aria-label="Página anterior"
                  disabled={shownPage <= 1}
                  onClick={() => update({ page: String(shownPage - 1) })}
                >
                  <ChevronLeft size={18} />
                </button>
                <span
                  className="current-page"
                  aria-label={`Página ${shownPage} de ${data.meta.totalPages}`}
                >
                  {shownPage}
                </span>
                <button
                  className="icon-button"
                  aria-label="Próxima página"
                  disabled={shownPage >= data.meta.totalPages}
                  onClick={() => update({ page: String(shownPage + 1) })}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
      {deleting && (
        <DeleteDialog
          user={deleting}
          onClose={() => setDeleting(undefined)}
          onDeleted={() => {
            setDeleting(undefined);
            refresh();
            toast('Usuário excluído com sucesso.');
          }}
        />
      )}
    </>
  );
}
