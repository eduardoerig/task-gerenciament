# Arquitetura

## Padrão
A solução usa **camadas inspiradas em Clean Architecture**:
- **Controllers:** interface HTTP.
- **Services:** regras de negócio.
- **Config/Utils/Middlewares:** infraestrutura e cross-cutting.
- **Prisma:** persistência.

## Fluxo
1. Frontend envia requisição para API.
2. Middleware valida JWT.
3. Controller delega para Service.
4. Service executa regra e persiste no banco.
5. Resposta retorna em JSON.

## Segurança
- Senhas com `bcrypt`.
- JWT com expiração de 7 dias.
- Validação de payload via `zod`.
