# GovAtende - Enterprise Challenge 3

Sistema integrado para atendimento de solicitações urbanas. A solução permite que cidadãos registrem e acompanhem solicitações, enquanto servidores públicos fazem a triagem, o atendimento e o acompanhamento dos chamados. O sistema também usa um serviço de inteligência artificial para classificar solicitações, sugerir prioridades e prever demandas.

## Arquitetura

O projeto é dividido em três módulos:

- **Frontend**: aplicação web em Next.js, responsável pelas interfaces do cidadão e do servidor.
- **Backend**: API REST em Java com Spring Boot. Centraliza autenticação, regras de negócio, persistência, solicitações, anexos, notificações e integração com a IA.
- **Python**: serviço FastAPI de inteligência artificial para classificação de solicitações e previsão de demandas.

Fluxo principal da integração:

```text
Frontend (Next.js :3000)
        |
        v
Backend (Spring Boot :8080) ----> Serviço de IA (FastAPI :8000)
        |
        v
Banco Oracle
```

## Funcionalidades

- Cadastro e autenticação de cidadãos e servidores
- Registro e acompanhamento de solicitações urbanas
- Consulta de categorias e subserviços
- Triagem e atualização de solicitações por servidores
- Histórico de alterações e notificações
- Inclusão e consulta de anexos
- Classificação automática de solicitações
- Sugestão de categoria, subserviço, urgência e prioridade
- Previsão de demandas por bairro e serviço
- Identificação de tendências de demanda

## Tecnologias

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Lucide React

### Backend

- Java 21
- Spring Boot 4
- Spring Web MVC
- Spring Data JPA
- Spring Security
- JWT
- Oracle Database
- Maven Wrapper

O backend não possui um README próprio. Ele é a API central da aplicação e está localizado em [`backend/`](backend/). A classe principal é `EnterpriseChallenge3Application`, e os controladores REST ficam em `backend/src/main/java/br/com/fiap/enterprise_challenge3/controller`.

### Serviço de IA

- Python 3.11 ou superior
- FastAPI
- Uvicorn
- Pandas

Consulte também a documentação específica em [`python/README.md`](python/README.md) e a documentação original do frontend em [`frontend/README.md`](frontend/README.md).

## Pré-requisitos

- Node.js e npm
- Java 21
- Python 3.11 ou superior e pip
- Acesso ao banco Oracle utilizado pelo backend

## Configuração

### Backend

O backend utiliza o perfil `local` e as configurações ficam em:

- [`backend/src/main/resources/application.properties`](backend/src/main/resources/application.properties)
- [`backend/src/main/resources/application-local.properties`](backend/src/main/resources/application-local.properties)

Antes de executar a aplicação, configure localmente a conexão com o Oracle, o segredo JWT, o diretório de uploads e a origem permitida do frontend. Não publique senhas, chaves JWT ou outras credenciais no repositório.

Por padrão, a aplicação espera:

- Backend: `http://localhost:8080`
- Serviço de IA: `http://127.0.0.1:8000`
- Frontend: `http://localhost:3000`

### Serviço de IA

O serviço Python não exige banco de dados. Suas dependências estão em [`python/requirements.txt`](python/requirements.txt).

## Como executar

Abra três terminais, um para cada módulo.

### 1. Serviço de IA

No Windows PowerShell:

```powershell
cd python
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Verifique a saúde do serviço em `http://localhost:8000/health`.

### 2. Backend

No Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

A API ficará disponível em `http://localhost:8080`. Um endpoint simples para verificar o backend é `GET /api/status`.

### 3. Frontend

No Windows PowerShell:

```powershell
cd frontend
npm install
npm run dev
```

A aplicação ficará disponível em [http://localhost:3000](http://localhost:3000).

Para uma compilação de produção:

```powershell
npm run build
npm run start
```

## Endpoints principais

### Backend

- `POST /api/auth/login` - login de cidadão
- `POST /api/auth/servidor/login` - login de servidor
- `GET /api/status` - status da aplicação
- `GET /api/categorias` - lista de categorias
- `GET /api/categorias/{id}` - consulta uma categoria
- `GET /api/categorias/{categoriaId}/subservicos` - lista subserviços
- `POST /api/solicitacoes` - cria uma solicitação
- `GET /api/solicitacoes/minhas` - lista solicitações do cidadão autenticado
- `GET /api/servidor/solicitacoes` - lista solicitações para o servidor
- `GET /api/servidor/solicitacoes/fila-triagem` - fila de triagem
- `GET /api/notificacoes` - lista notificações
- `GET /api/previsoes-demanda/ultima` - consulta a última previsão

Os endpoints protegidos exigem autenticação conforme as regras configuradas no Spring Security.

### Serviço de IA

- `GET /health` - verifica a saúde e a versão dos modelos
- `POST /analisar` - classifica uma solicitação e calcula sua prioridade
- `POST /prever-demandas` - gera previsões de demanda a partir de um histórico

A documentação interativa gerada pelo FastAPI fica disponível, durante a execução, em:

- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

## Testes e qualidade

### Backend

```powershell
cd backend
.\mvnw.cmd test
```

### Frontend

```powershell
cd frontend
npm run lint
npm run build
```

### Python

A validação manual pode ser feita pelo endpoint `/health` e pela documentação interativa em `/docs`.

## Estrutura do projeto

```text
enterprise challenge/
├── backend/     # API Java Spring Boot e persistência
├── frontend/    # Aplicação web Next.js
├── python/      # Serviço FastAPI de inteligência artificial
└── README.md    # Documentação geral do projeto
```
