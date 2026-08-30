import { useAuth } from '../../contexts/AuthContext';
import { signOut } from '../../services/authService';
import './TopNav.css';

export default function TopNav() {
  const { user } = useAuth();

  return (
    <nav className="top-nav">
      <div className="nav-left">
        <h1 className="nav-logo">
          <span className="logo-ledger">LEDGER</span>
          <span className="logo-frame">FRAME</span>
        </h1>
      </div>
      <div className="nav-right">
        <span className="nav-email">{user?.email}</span>
        <button className="btn btn-ghost btn-sm" onClick={signOut}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}
