import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, Home, Menu, ShieldCheck, Users, X } from 'lucide-react';
export function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(true);
  const main = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const pendingFocus = useRef<'menu' | 'heading' | null>(null);
  function closeMenu(destination: 'menu' | 'heading' = 'menu') {
    pendingFocus.current = destination;
    setMobileOpen(false);
  }
  function navigateFromMenu() {
    if (mobileOpen) closeMenu('heading');
  }
  useEffect(() => {
    pendingFocus.current = 'heading';
    setMobileOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (mobileOpen) return;
    // Effects run after the DOM commit, when app-body is no longer inert.
    const destination = pendingFocus.current;
    pendingFocus.current = null;
    if (destination === 'menu') menuButton.current?.focus();
    else if (destination === 'heading') main.current?.querySelector<HTMLElement>('h1')?.focus();
  }, [mobileOpen, location.pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebar.current?.querySelector<HTMLElement>('button')?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeMenu();
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(
        sidebar.current?.querySelectorAll<HTMLElement>('a, button:not([disabled])') || [],
      ).filter((element) => element.offsetParent !== null);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener('keydown', keydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keydown);
    };
  }, [mobileOpen]);
  const isUsers = location.pathname.startsWith('/users');
  return (
    <div className="app-layout">
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      {mobileOpen && <div className="sidebar-backdrop" onClick={() => closeMenu()} />}
      <aside ref={sidebar} id="sidebar" className={`sidebar${mobileOpen ? ' is-open' : ''}`}>
        <div className="brand-row">
          <Link to="/" className="brand" aria-label="WenLock — início" onClick={navigateFromMenu}>
            <span>Wen</span>Lock<span className="brand-dot">.</span>
          </Link>
          <button
            className="icon-button sidebar-close"
            onClick={() => closeMenu()}
            aria-label="Fechar menu"
          >
            <X size={21} />
          </button>
        </div>
        <div className="sidebar-label">PRINCIPAL</div>
        <nav aria-label="Navegação principal">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={navigateFromMenu}
          >
            <Home size={19} />
            Home
          </NavLink>
          <button
            className={`nav-link nav-group${isUsers ? ' group-active' : ''}`}
            onClick={() => setAccessOpen(!accessOpen)}
            aria-expanded={accessOpen}
            aria-controls="access-menu"
          >
            <ShieldCheck size={19} />
            Controle de Acesso
            <ChevronDown size={16} className={accessOpen ? 'chevron expanded' : 'chevron'} />
          </button>
          {accessOpen && (
            <div id="access-menu" className="subnav">
              <NavLink
                to="/users"
                onClick={navigateFromMenu}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <Users size={17} />
                Usuários
              </NavLink>
            </div>
          )}
        </nav>
        <div className="sidebar-bottom">
          <span className="sidebar-emblem">
            <ShieldCheck size={18} />
          </span>
          <div>
            WenLock<small>Gestão de usuários</small>
          </div>
        </div>
      </aside>
      <div className="app-body" inert={mobileOpen}>
        <header className="topbar">
          <div className="topbar-left">
            <button
              ref={menuButton}
              className="icon-button mobile-menu"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
              aria-controls="sidebar"
              aria-expanded={mobileOpen}
            >
              <Menu size={23} />
            </button>
            <span className="topbar-title">Sistema de gerenciamento</span>
          </div>
          <div className="profile">
            <span className="avatar" aria-hidden="true">
              A
            </span>
            <div>
              Administrador<small>Bem-vindo ao WenLock</small>
            </div>
          </div>
        </header>
        <main ref={main} id="main" className="main-content">
          <nav aria-label="Localização" className="breadcrumb">
            <Link to="/">
              <Home size={14} />
              <span>Home</span>
            </Link>
            {isUsers && (
              <>
                <ChevronRight size={13} />
                <span>Controle de Acesso</span>
                <ChevronRight size={13} />
                {location.pathname === '/users' ? (
                  <span aria-current="page">Usuários</span>
                ) : (
                  <Link to="/users">Usuários</Link>
                )}
              </>
            )}
          </nav>
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>WenLock</span>
          <span>Sistema de gerenciamento de usuários</span>
        </footer>
      </div>
    </div>
  );
}
