import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? form : { email: form.email, password: form.password };
      const { data } = await api.post(endpoint, payload);
      login(data.token);
      navigate('/');
    } catch {
      setError('Não foi possível autenticar. Verifique seus dados.');
    }
  }

  return (
    <section className="center-card">
      <h1>{isRegister ? 'Criar conta' : 'Entrar'}</h1>
      <form onSubmit={submit}>
        {isRegister && (
          <input
            placeholder="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}
        <input
          placeholder="E-mail"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Senha"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Continuar</button>
      </form>
      <button className="link" onClick={() => setIsRegister((v) => !v)}>
        {isRegister ? 'Já tenho conta' : 'Quero me cadastrar'}
      </button>
    </section>
  );
}
