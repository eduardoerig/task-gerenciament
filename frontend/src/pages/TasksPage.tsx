import { useEffect, useState } from 'react';
import { TaskCard } from '../components/TaskCard';
import api from '../services/api';
import type { Task } from '../types';

const initial = {
  title: '',
  description: '',
  category: 'REST',
  priority: 'LIGHT',
  dueDate: '',
  estimatedMins: 30
};

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState(initial);

  async function load() {
    const { data } = await api.get('/tasks');
    setTasks(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/tasks', { ...form, dueDate: new Date(form.dueDate).toISOString() });
    setForm(initial);
    load();
  }

  async function complete(id: string) {
    await api.patch(`/tasks/${id}/complete`);
    load();
  }

  return (
    <section>
      <h2>Planejar atividades</h2>
      <form className="card" onSubmit={createTask}>
        <input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="inline">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {['SPORTS', 'READING', 'SOCIAL', 'REST', 'CULTURE', 'CREATIVITY', 'OUTDOOR'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {['LIGHT', 'MODERATE', 'IMPORTANT'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
          <input type="number" min={10} max={600} value={form.estimatedMins} onChange={(e) => setForm({ ...form, estimatedMins: Number(e.target.value) })} />
        </div>
        <button type="submit">Adicionar tarefa</button>
      </form>

      <div className="grid">
        {tasks.map((task) => <TaskCard key={task.id} task={task} onComplete={complete} />)}
      </div>
    </section>
  );
}
