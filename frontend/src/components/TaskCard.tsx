import type { Task } from '../types';

export function TaskCard({ task, onComplete }: { task: Task; onComplete: (id: string) => void }) {
  return (
    <article className={`card ${task.completed ? 'done' : ''}`}>
      <header>
        <h3>{task.title}</h3>
        <span className={`pill ${task.priority.toLowerCase()}`}>{task.priority}</span>
      </header>
      <p>{task.description ?? 'Sem descrição'}</p>
      <small>
        {task.category} • {new Date(task.dueDate).toLocaleDateString('pt-BR')} • {task.estimatedMins} min
      </small>
      {!task.completed && <button onClick={() => onComplete(task.id)}>Concluir</button>}
    </article>
  );
}
