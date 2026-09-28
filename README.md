# GovAtende — Front-end

Interface web do GovAtende, uma plataforma GovTech para registro, acompanhamento e gestão de solicitações de serviços públicos urbanos.

O front-end atende cidadãos, servidores públicos e responsáveis por auditoria, consumindo a API Java por meio de rotas BFF do Next.js.

## Funcionalidades

### Cidadão

- cadastro e autenticação;
- consulta do catálogo de serviços;
- registro de solicitações urbanas;
- envio e consulta de anexos;
- acompanhamento do status;
- histórico da solicitação;
- notificações;
- atualização e desativação da conta.

### Servidor público

- autenticação interna;
- painel de solicitações;
- consulta detalhada de ocorrências;
- alteração de status;
- consulta e download de anexos;
- relatórios estatísticos;
- previsão de demanda por bairro e serviço;
- gráficos e histórico das previsões.

### Auditor

- autenticação com perfil específico;
- consulta de relatórios;
- consulta das trilhas de auditoria;
- filtros por ator, ação, recurso, resultado e período.

## Tecnologias

- Next.js 16;
- React 19;
- TypeScript;
- Tailwind CSS 4;
- Shadcn/UI;
- Recharts;
- React Hook Form;
- Yup;
- SweetAlert2;
- Lucide React.

## Arquitetura

```text
Navegador
-> Next.js
-> BFF /api/backend
-> API Java Spring Boot
-> Oracle Database
-> Serviço Python/FastAPI
```

O navegador não acessa o JWT diretamente. O token retornado pelo backend Java é armazenado pelo Next.js em cookies `HttpOnly`.

Cookies utilizados:

```text
govatende_session
govatende_servidor_session
```

O BFF lê o cookie no servidor, adiciona o token ao cabeçalho `Authorization` e encaminha a requisição para a API Java.

## Pré-requisitos

- Node.js 20 ou superior;
- npm;
- backend Java executando em `http://localhost:8080`;
- serviço Python executando em `http://localhost:8000` para funcionalidades de inteligência artificial.

## Configuração

Crie o arquivo local de configuração:

```powershell
Copy-Item .env.example .env.local
```

Conteúdo esperado:

```env
BACKEND_API_URL=http://localhost:8080/api
```

O arquivo `.env.local` não deve ser versionado porque pode conter configurações específicas do ambiente.

## Instalação

Instale as dependências:

```powershell
npm install
```

Inicie o ambiente de desenvolvimento:

```powershell
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Scripts

Executar o projeto em desenvolvimento:

```powershell
npm run dev
```

Validar o ESLint:

```powershell
npm run lint
```

Validar o TypeScript:

```powershell
npx tsc --noEmit
```

Gerar a build de produção:

```powershell
npm run build
```

Executar a build:

```powershell
npm run start
```

## Rotas principais

| Rota                            | Perfil           | Descrição                       |
| ------------------------------- | ---------------- | ------------------------------- |
| `/`                             | Público/Cidadão  | Acesso inicial e autenticação   |
| `/cadastro`                     | Público          | Cadastro de cidadão             |
| `/servicos`                     | Cidadão          | Catálogo de serviços            |
| `/servicos/registro-ocorrencia` | Cidadão          | Registro de solicitação         |
| `/servicos/minhas-solicitacoes` | Cidadão          | Acompanhamento das solicitações |
| `/configuracoes`                | Autenticado      | Configurações da conta          |
| `/servidor`                     | Público interno  | Login de servidor ou auditor    |
| `/servidor/painel`              | Servidor         | Painel administrativo           |
| `/servidor/relatorios`          | Servidor/Auditor | Relatórios estatísticos         |
| `/servidor/previsoes-demanda`   | Servidor         | Previsão de demanda             |
| `/servidor/auditoria`           | Auditor          | Trilhas de auditoria            |

## Segurança

O front-end adota as seguintes medidas:

- JWT armazenado em cookie `HttpOnly`;
- ausência de token no `localStorage`;
- atributo `Secure` em produção;
- política `SameSite=Lax`;
- validação da origem em operações de alteração;
- BFF para impedir exposição direta do token;
- separação entre cookies de cidadão e servidor;
- controle de acesso definitivo realizado pelo Spring Security;
- remoção automática do cookie quando o backend retorna `401`.

O parâmetro de perfil usado na interface não concede autorização. O backend Java sempre valida o perfil presente no JWT.

## Validação

Antes de criar um Pull Request ou entregar o projeto, execute:

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

## Repositórios relacionados

- Front-end: https://github.com/Lsko27/govAtende
- Backend Java: https://github.com/Lsko27/enterprise-challenge3
- Serviço Python: https://github.com/Lsko27/enterprise-challenge3-python

## Integrantes

- Yuri Lesko — RM 564119
- Caio Oliveira — RM 561294
- Rebeka Luna Lima — RM 565859
- Sérgio Cavalcante — RM 563208
- Rubens Escobar — RM 562164

## Projeto acadêmico

Projeto desenvolvido para a FIAP no contexto do HackGov, com foco na aplicação de tecnologia para melhorar a gestão e o atendimento de serviços públicos urbanos.
