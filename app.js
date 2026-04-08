const STORAGE_KEYS = {
  users: 'lazer_users_v1',
  session: 'lazer_session_v1',
  tasks: 'lazer_tasks_v1',
  goals: 'lazer_goals_v1'
};

const CATEGORIES = ['esportes', 'leitura', 'social', 'descanso', 'cultura', 'criatividade', 'ar-livre'];
const PRIORITIES = ['leve', 'moderado', 'importante'];

const app = document.getElementById('app');

function getData(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function setData(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

function currentUser() {
  const session = getData(STORAGE_KEYS.session, null);
  if (!session) return null;
  const users = getData(STORAGE_KEYS.users, []);
  return users.find(u => u.id === session.userId) ?? null;
}

function userTasks(userId) {
  return getData(STORAGE_KEYS.tasks, []).filter(t => t.userId === userId);
}

function saveTask(task) {
  const all = getData(STORAGE_KEYS.tasks, []);
  setData(STORAGE_KEYS.tasks, [...all, task]);
}

function updateTask(taskId, fn) {
  const all = getData(STORAGE_KEYS.tasks, []);
  setData(STORAGE_KEYS.tasks, all.map(t => t.id === taskId ? fn(t) : t));
}

function deleteTask(taskId) {
  const all = getData(STORAGE_KEYS.tasks, []);
  setData(STORAGE_KEYS.tasks, all.filter(t => t.id !== taskId));
}

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

function suggestions(tasks) {
  const minutes = CATEGORIES.reduce((acc, c) => ({ ...acc, [c]: 0 }), {});
  tasks.filter(t => t.done).forEach(t => { minutes[t.category] += Number(t.minutes); });
  const least = Object.entries(minutes).sort((a, b) => a[1] - b[1])[0][0];
  const map = {
    esportes: ['Caminhada de 20 min', 'Alongamento leve por 10 min'],
    leitura: ['Ler 10 páginas', 'Revisitar um trecho favorito'],
    social: ['Mandar mensagem para um amigo', 'Marcar um café rápido'],
    descanso: ['Respiração guiada de 5 min', 'Pausa sem telas'],
    cultura: ['Ouvir um álbum novo', 'Assistir um mini documentário'],
    criatividade: ['Desenhar por 15 min', 'Escrever uma ideia no diário'],
    'ar-livre': ['Passeio no quarteirão', 'Ver o pôr do sol']
  };
  return { least, list: map[least] };
}

function streak(tasks) {
  const doneDays = [...new Set(tasks.filter(t => t.doneAt).map(t => t.doneAt.slice(0, 10)))].sort().reverse();
  let cur = new Date();
  cur.setHours(0, 0, 0, 0);
  let count = 0;
  for (const day of doneDays) {
    const d = new Date(day + 'T00:00:00');
    if (d.getTime() === cur.getTime()) {
      count += 1;
      cur.setDate(cur.getDate() - 1);
    } else if (d < cur) break;
  }
  return count;
}

function renderAuth() {
  app.innerHTML = `
    <div class="center card grid">
      <h1>Lazer+ no GitHub Pages</h1>
      <p class="small">Cadastro e login local (localStorage).</p>
      <input id="name" placeholder="Nome (só no cadastro)" />
      <input id="email" placeholder="E-mail" type="email" />
      <input id="password" placeholder="Senha" type="password" />
      <div class="inline">
        <button id="register">Cadastrar</button>
        <button class="secondary" id="login">Entrar</button>
      </div>
    </div>
  `;

  document.getElementById('register').onclick = () => {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    if (!name || !email || password.length < 4) return toast('Preencha nome, e-mail e senha (mín 4).');
    const users = getData(STORAGE_KEYS.users, []);
    if (users.some(u => u.email === email)) return toast('E-mail já cadastrado.');
    const user = { id: uid(), name, email, password };
    setData(STORAGE_KEYS.users, [...users, user]);
    setData(STORAGE_KEYS.session, { userId: user.id });
    render();
  };

  document.getElementById('login').onclick = () => {
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const users = getData(STORAGE_KEYS.users, []);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return toast('Credenciais inválidas.');
    setData(STORAGE_KEYS.session, { userId: user.id });
    render();
  };
}

function renderApp(active = 'dashboard') {
  const user = currentUser();
  const tasks = userTasks(user.id);
  const done = tasks.filter(t => t.done);
  const totalMinutes = done.reduce((s, t) => s + Number(t.minutes), 0);
  const s = suggestions(tasks);

  app.innerHTML = `
    <div class="container">
      <div class="header">
        <div>
          <div class="brand">Lazer+</div>
          <div class="small">Olá, ${user.name}! Equilíbrio entre produtividade e descanso.</div>
        </div>
        <button class="secondary" id="logout">Sair</button>
      </div>

      <div class="tabs">
        ${['dashboard', 'tarefas', 'metas', 'agenda', 'relax'].map(t => `<button class="tab ${active === t ? 'active' : ''}" data-tab="${t}">${t}</button>`).join('')}
      </div>

      <section id="view"></section>
    </div>
  `;

  document.querySelectorAll('[data-tab]').forEach(btn => btn.onclick = () => renderApp(btn.dataset.tab));
  document.getElementById('logout').onclick = () => { localStorage.removeItem(STORAGE_KEYS.session); render(); };

  const view = document.getElementById('view');

  if (active === 'dashboard') {
    const byCat = CATEGORIES.map(c => `<li>${c}: ${done.filter(t => t.category === c).reduce((sum, t) => sum + Number(t.minutes), 0)} min</li>`).join('');
    view.innerHTML = `
      <div class="grid cols-3">
        <article class="card"><h3>Tempo de lazer</h3><p>${totalMinutes} min</p></article>
        <article class="card"><h3>Atividades concluídas</h3><p>${done.length}</p></article>
        <article class="card"><h3>Streak atual</h3><p>${streak(tasks)} dias</p></article>
      </div>
      <div class="grid cols-3" style="margin-top:12px;">
        <article class="card"><h3>Estatísticas por categoria</h3><ul>${byCat}</ul></article>
        <article class="card"><h3>Sugestões inteligentes</h3><p>Categoria menos explorada: <b>${s.least}</b></p><ul>${s.list.map(i => `<li>${i}</li>`).join('')}</ul></article>
        <article class="card"><h3>Conquistas</h3><ul>
          <li>${done.length >= 5 ? '✅' : '⬜'} 5 atividades concluídas</li>
          <li>${streak(tasks) >= 3 ? '✅' : '⬜'} streak de 3 dias</li>
          <li>${totalMinutes >= 180 ? '✅' : '⬜'} 180 minutos de lazer</li>
        </ul></article>
      </div>
    `;
  }

  if (active === 'tarefas') {
    view.innerHTML = `
      <div class="card grid">
        <h3>Nova tarefa de lazer</h3>
        <input id="title" placeholder="Título" />
        <textarea id="desc" placeholder="Descrição"></textarea>
        <div class="row">
          <select id="category">${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}</select>
          <select id="priority">${PRIORITIES.map(p => `<option value="${p}">${p}</option>`).join('')}</select>
          <input id="date" type="date" />
          <input id="minutes" type="number" min="10" max="480" value="30" />
        </div>
        <button id="addTask">Adicionar tarefa</button>
      </div>
      <div id="taskList" class="grid" style="margin-top:12px;"></div>
    `;

    const list = document.getElementById('taskList');
    const renderTasks = () => {
      const current = userTasks(user.id).sort((a, b) => Number(a.done) - Number(b.done));
      list.innerHTML = current.length ? current.map(t => `
        <article class="card task ${t.done ? 'done' : ''}">
          <div class="inline" style="justify-content:space-between; align-items:center;">
            <strong>${t.title}</strong>
            <span class="badge">${t.priority}</span>
          </div>
          <div>${t.description || 'Sem descrição'}</div>
          <div class="small">${t.category} • ${t.date || '-'} • ${t.minutes} min</div>
          <div class="inline">
            ${t.done ? '' : `<button data-done="${t.id}">Concluir</button>`}
            <button class="danger" data-del="${t.id}">Excluir</button>
          </div>
        </article>
      `).join('') : '<div class="card">Sem tarefas ainda.</div>';

      list.querySelectorAll('[data-done]').forEach(btn => btn.onclick = () => {
        updateTask(btn.dataset.done, t => ({ ...t, done: true, doneAt: new Date().toISOString() }));
        toast('Tarefa concluída 🎉');
        renderTasks();
      });
      list.querySelectorAll('[data-del]').forEach(btn => btn.onclick = () => {
        deleteTask(btn.dataset.del);
        renderTasks();
      });
    };

    document.getElementById('addTask').onclick = () => {
      const title = document.getElementById('title').value.trim();
      if (!title) return toast('Informe um título.');
      saveTask({
        id: uid(),
        userId: user.id,
        title,
        description: document.getElementById('desc').value.trim(),
        category: document.getElementById('category').value,
        priority: document.getElementById('priority').value,
        date: document.getElementById('date').value,
        minutes: Number(document.getElementById('minutes').value || 30),
        done: false,
        doneAt: null
      });
      toast('Tarefa criada com sucesso.');
      renderTasks();
    };

    renderTasks();
  }

  if (active === 'metas') {
    const goals = getData(STORAGE_KEYS.goals, []).filter(g => g.userId === user.id);
    view.innerHTML = `
      <div class="card grid">
        <h3>Criar meta</h3>
        <div class="row">
          <input id="goalTitle" placeholder="Ex: 120 min de descanso" />
          <input id="goalTarget" type="number" placeholder="Minutos alvo" />
          <select id="goalPeriod"><option value="semanal">semanal</option><option value="mensal">mensal</option></select>
        </div>
        <button id="addGoal">Salvar meta</button>
      </div>
      <div id="goalList" class="grid" style="margin-top:12px;"></div>
    `;

    const goalList = document.getElementById('goalList');
    const renderGoals = () => {
      const current = getData(STORAGE_KEYS.goals, []).filter(g => g.userId === user.id);
      const doneMins = userTasks(user.id).filter(t => t.done).reduce((s, t) => s + Number(t.minutes), 0);
      goalList.innerHTML = current.length ? current.map(g => `
        <article class="card">
          <strong>${g.title}</strong>
          <div class="small">Período: ${g.period} • Progresso: ${doneMins}/${g.target} min</div>
        </article>
      `).join('') : '<article class="card">Nenhuma meta cadastrada.</article>';
    };

    document.getElementById('addGoal').onclick = () => {
      const title = document.getElementById('goalTitle').value.trim();
      const target = Number(document.getElementById('goalTarget').value);
      const period = document.getElementById('goalPeriod').value;
      if (!title || !target) return toast('Preencha título e minutos.');
      const all = getData(STORAGE_KEYS.goals, []);
      setData(STORAGE_KEYS.goals, [...all, { id: uid(), userId: user.id, title, target, period }]);
      toast('Meta criada.');
      renderGoals();
    };

    renderGoals();
  }

  if (active === 'agenda') {
    const next = tasks.filter(t => !t.done && t.date).sort((a, b) => a.date.localeCompare(b.date));
    view.innerHTML = `
      <article class="card">
        <h3>Agenda/Calendário (MVP para GitHub Pages)</h3>
        <p class="small">Lista de próximas atividades por data.</p>
        <ul>${next.map(t => `<li>${t.date} — ${t.title} (${t.category})</li>`).join('') || '<li>Sem eventos agendados.</li>'}</ul>
      </article>
    `;
  }

  if (active === 'relax') {
    const focus = tasks.filter(t => !t.done).slice(0, 3);
    view.innerHTML = `
      <article class="card">
        <h3>Modo Relaxamento</h3>
        <p class="small">Interface simplificada com foco em poucas ações.</p>
        <ol>${focus.map(t => `<li>${t.title}</li>`).join('') || '<li>Sem pendências.</li>'}</ol>
        <button id="breath">Iniciar pausa de respiração (60s)</button>
      </article>
    `;
    document.getElementById('breath').onclick = () => toast('Respire fundo por 60 segundos 🧘');
  }
}

function render() {
  const user = currentUser();
  if (!user) return renderAuth();
  renderApp();
}

render();
