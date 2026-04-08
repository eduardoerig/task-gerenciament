import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Suggestion } from '../types';

interface Stats {
  totalMinutes: number;
  byCategory: Record<string, number>;
  streak: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

  useEffect(() => {
    api.get('/stats').then((r) => setStats(r.data));
    api.get('/suggestions').then((r) => setSuggestion(r.data));
  }, []);

  return (
    <section>
      <h2>Seu bem-estar hoje</h2>
      <div className="grid">
        <article className="card">
          <h3>Minutos de lazer</h3>
          <p>{stats?.totalMinutes ?? 0} min</p>
        </article>
        <article className="card">
          <h3>Streak saudável</h3>
          <p>{stats?.streak ?? 0} dias</p>
        </article>
      </div>

      <article className="card">
        <h3>Recomendação inteligente</h3>
        <p>Foco sugerido: {suggestion?.focusCategory ?? 'REST'}</p>
        <ul>{suggestion?.suggestions.map((item) => <li key={item}>{item}</li>)}</ul>
      </article>
    </section>
  );
}
