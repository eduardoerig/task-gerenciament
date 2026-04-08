# Lazer+ (HTML + CSS + JS) — pronto para GitHub Pages

Projeto 100% front-end (sem backend), feito com **HTML, CSS e JavaScript puro**, para rodar facilmente no **GitHub Pages**.

## Funcionalidades
- Cadastro e login local (dados no `localStorage`)
- CRUD de tarefas de lazer
- Categorias e prioridades
- Concluir tarefa + histórico implícito por data de conclusão
- Dashboard com estatísticas de bem-estar
- Metas semanais/mensais (simples)
- Sugestões inteligentes baseadas no comportamento
- Streak de dias consecutivos
- Modo relaxamento (interface simplificada)
- Agenda (MVP em lista por data)

## Estrutura
- `index.html`
- `styles.css`
- `app.js`
- `.nojekyll` (evita problemas no Pages)

## Rodar localmente
Basta abrir `index.html` no navegador.

Se preferir servidor local:

```bash
# Python 3
python -m http.server 8080
```

Acesse `http://localhost:8080`.

## Publicar no GitHub Pages
1. Suba o repositório para o GitHub.
2. Vá em **Settings > Pages**.
3. Em **Build and deployment**, escolha:
   - **Source:** Deploy from a branch
   - **Branch:** `main` (ou a branch desejada), pasta `/root`
4. Salve.
5. Aguarde o deploy e abra a URL gerada pelo GitHub Pages.

## Observações
- Como não há backend, tudo fica salvo localmente no navegador do usuário.
- Para resetar dados: limpar `localStorage` do site.
