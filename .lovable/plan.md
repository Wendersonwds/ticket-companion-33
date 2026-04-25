# Contagem de clientes cadastrados no painel admin

## Diagnóstico

A página `/admin/clients` já exibe `{filtered.length} cliente(s) cadastrado(s)`, mas o número pode estar baixo/zero porque o sistema lê **apenas a tabela `public.clients`** — não a tabela `public.users`.

Cenários possíveis:
1. **Usuário se cadastra mas não vira "cliente"**: se não existe trigger criando registro em `clients` quando alguém se registra com role `client`, ele nunca aparece na listagem. → resolver no Supabase (trigger) **ou** no código (listar a partir de `users` com role `client`).
2. **Tabela `clients` está populada normalmente**: então é só uma questão de UI — destacar melhor o número.

## O que vou fazer (no código-fonte)

### 1. Trocar a fonte de dados em `src/services/admin.ts`
- `getAdminClients()` passa a buscar de `public.users` filtrando `role = 'client'`, e faz LEFT JOIN com `clients` (para pegar `created_at` do perfil de cliente) e contagem de `tickets`.
- Assim, **todo usuário cadastrado como cliente aparece**, mesmo sem registro em `clients`.
- Mantém os campos que a UI já usa: `id`, `name`, `email`, `created_at`, `ticketCount`.

### 2. Destacar o total em `src/pages/admin/AdminClients.tsx`
- Adicionar um card de destaque no topo com:
  - **Total de clientes cadastrados** (número grande)
  - **Novos nos últimos 7 dias**
  - **Clientes com tickets abertos**
- Manter a busca e o grid existentes.

### 3. Atualizar `getAdminMetrics()` (em `admin.ts`)
- Contar `totalClientes` a partir de `users` (role `client`) em vez de `clients`, para o número bater entre as telas Visão Geral e Clientes.

## Se o problema for no Supabase

Se mesmo após a mudança o número continuar errado, é porque a tabela `users` não está sendo populada no signup. Nesse caso você precisa garantir no Supabase:

- Existe trigger `on_auth_user_created` que insere em `public.users` quando alguém se cadastra em `auth.users`.
- A policy de SELECT em `public.users` permite leitura para admin (via `is_admin(auth.uid())`).

Eu te aviso depois de aplicar o código se ainda parece haver dado faltando, e aí criamos a migration do trigger.

## Arquivos afetados
- `src/services/admin.ts` (refatorar `getAdminClients` e ajustar `getAdminMetrics`)
- `src/pages/admin/AdminClients.tsx` (adicionar card de total em destaque)
