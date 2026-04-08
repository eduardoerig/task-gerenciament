import { useEffect, useState } from 'react';
import api from '../services/api';

interface Goal {
  id: string;
  title: string;
  targetMinutes: number;
  periodType: string;
}

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    api.get('/goals').then((r) => setGoals(r.data));
  }, []);

  return (
    <section>
      <h2>Metas semanais e mensais</h2>
      <div className="grid">
        {goals.map((goal) => (
          <article key={goal.id} className="card">
            <h3>{goal.title}</h3>
            <p>{goal.targetMinutes} min ({goal.periodType})</p>
          </article>
        ))}
      </div>
    </section>
  );
}
