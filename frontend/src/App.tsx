import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Feedback';
import { HomePage } from './pages/HomePage';
import { UsersPage } from './pages/UsersPage';
import { CreateUserPage, EditUserPage, ViewUserPage } from './pages/UserPages';
export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/new" element={<CreateUserPage />} />
            <Route path="users/:id" element={<ViewUserPage />} />
            <Route path="users/:id/edit" element={<EditUserPage />} />
            <Route
              path="*"
              element={
                <section className="card state-panel">
                  <h1 tabIndex={-1}>Página não encontrada</h1>
                  <p>O endereço acessado não existe.</p>
                  <Link className="button primary" to="/">
                    Voltar para Home
                  </Link>
                </section>
              }
            />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
