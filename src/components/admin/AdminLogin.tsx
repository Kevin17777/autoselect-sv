import { useState } from 'react';

const AUTH_KEY = 'autoselect_admin_auth';
const PASSWORD_KEY = 'autoselect_admin_password';
const DEFAULT_PASSWORD = 'admin123';

function getStoredPassword(): string {
  try {
    return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
  } catch {
    return DEFAULT_PASSWORD;
  }
}

export function isAuthenticated(): boolean {
  try {
    return localStorage.getItem(AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function login(password: string): boolean {
  if (password === getStoredPassword()) {
    localStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function changePassword(newPassword: string): void {
  localStorage.setItem(PASSWORD_KEY, newPassword);
}

type Props = {
  onSuccess: () => void;
};

export default function AdminLogin({ onSuccess }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-deep p-4">
      <div className="glass-panel p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-white/40 text-xs uppercase tracking-[0.25em] font-semibold mb-1">AutoSelect Admin</p>
          <h1 className="text-white font-black text-2xl">Acceso restringido</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/40 block mb-1">Contraseña</label>
            <input type="password" value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className="input-premium text-sm p-3.5 w-full" placeholder="Ingrese contraseña" autoFocus />
          </div>
          {error && <p className="text-sport text-xs">Contraseña incorrecta</p>}
          <button type="submit" className="btn-sport w-full text-sm py-3">
            Ingresar
          </button>
        </form>
        <p className="text-white/20 text-[10px] text-center mt-4">
          Contraseña por defecto: admin123
        </p>
      </div>
    </div>
  );
}
