import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Lazer+</h1>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/tasks">Tarefas</Link>
          <Link to="/goals">Metas</Link>
          <Link to="/calendar">Calendário</Link>
        </nav>
        <button onClick={logout}>Sair</button>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
