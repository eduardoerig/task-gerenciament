# Lazer+ — Sistema de Gerenciamento de Tarefas de Lazer

Aplicação fullstack para planejamento de atividades pessoais (hobbies, descanso, social), com foco em motivação e bem-estar.

## Stack adotada
- **Frontend:** React + Vite + TypeScript (mobile-first e UI minimalista)
- **Backend:** Node.js + Express + TypeScript (API REST, JWT, validação Zod)
- **Banco:** Prisma ORM (SQLite no MVP, pronto para migrar para PostgreSQL)

## Estrutura
```
.
├── backend
│   ├── prisma
│   └── src
│       ├── config
│       ├── controllers
│       ├── middlewares
│       ├── routes
│       ├── services
│       └── utils
├── frontend
│   └── src
│       ├── components
│       ├── context
│       ├── pages
│       ├── services
│       ├── styles
│       └── types
└── docs
    ├── arquitetura.md
    ├── prototipo-telas.md
    └── requisitos.md
```

## Funcionalidades entregues no código inicial
- Cadastro/login de usuários com JWT.
- CRUD de tarefas de lazer com categoria, prioridade, data e duração.
- Marcar tarefa como concluída com registro automático no histórico.
- Dashboard com minutos de lazer, streak e sugestões inteligentes.
- Metas semanais/mensais.
- Base de gamificação (conquista após 5 tarefas concluídas).
- Agenda (MVP) com evolução prevista para integração Google Calendar.
- Sistema de lembretes (job agendado no backend, pronto para integrar push/email).

## Como rodar
### 1) Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
Servidor em `http://localhost:4000`.

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```
App em `http://localhost:5173`.

## Próximos passos recomendados
1. Trocar SQLite por PostgreSQL em produção.
2. Implementar notificações reais (OneSignal/Firebase + e-mail SMTP).
3. Integrar OAuth Google Calendar.
4. Evoluir IA de sugestões com modelo comportamental e sazonalidade.
