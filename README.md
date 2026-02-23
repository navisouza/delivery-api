# Coco Bambu — Delivery API

API REST para gerenciamento de pedidos de delivery, com interface web para visualização e controle de status em tempo real.

---

## Como executar

> **Antes de começar:** certifique-se de que o arquivo `pedidos.json` (fornecido pelo desafio) está em `backend/data/pedidos.json`. O banco é populado automaticamente a partir dele na primeira inicialização. Sem o arquivo, a aplicação sobe normalmente, mas sem dados iniciais.

### Opção 1 — Docker (recomendado)

**Pré-requisitos:** [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados.

```bash
# 1. Clone o repositório
git clone https://github.com/navisouza/delivery-api
cd delivery-api

# 2. Suba os containers
docker compose up --build
```

Acesse:

- **Frontend:** http://localhost:3000
- **API REST:** http://localhost:8000/pedidos/
- **Swagger (docs interativos):** http://localhost:8000/docs

> Para reiniciar do zero (limpar banco e recarregar JSON): `docker compose down -v && docker compose up --build`

---

### Opção 2 — Rodar localmente (sem Docker)

**Pré-requisitos:** Python 3.12+ e Node.js 18+ instalados.

**Backend:**

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend** (em outro terminal):

```bash
cd frontend
npm install
npm start
```

---

## Estrutura do projeto

```
delivery-api/
├── backend/
│   ├── app/
│   │   ├── main.py          # Entrypoint FastAPI + seed do banco
│   │   ├── database.py      # Configuração SQLAlchemy / SQLite
│   │   ├── models.py        # Modelo ORM (PedidoDB)
│   │   ├── schemas.py       # Schemas Pydantic (validação de entrada/saída)
│   │   ├── repository.py    # Acesso a dados (CRUD)
│   │   ├── services.py      # Regras de negócio (máquina de estados)
│   │   └── router.py        # Endpoints REST
│   ├── tests/
│   │   └── test_service.py  # Testes unitários da máquina de estados
│   ├── data/
│   │   └── pedidos.json     # Dados iniciais (fornecido pelo desafio)
│   │   └── delivery.db      # Banco SQLite
│   └── Dockerfile
│   │
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── OrderCard.tsx      # Card de exibição de pedido
│       │   └── AddOrderModal.tsx  # Modal de criação de pedido
│       └── hooks/
│       │   └── useOrders.ts       # Hook de integração com a API
│       └── types/
│           └── index.tsx
└── docker-compose.yml
```

---

## Endpoints da API

| Método   | Rota                         | Descrição                 | Status de retorno        |
| -------- | ---------------------------- | ------------------------- | ------------------------ |
| `GET`    | `/pedidos/`                  | Lista todos os pedidos    | 200                      |
| `GET`    | `/pedidos/{order_id}`        | Busca pedido por ID       | 200 / 404                |
| `POST`   | `/pedidos/`                  | Cria novo pedido          | 201 / 409 (ID duplicado) |
| `PATCH`  | `/pedidos/{order_id}/status` | Atualiza status do pedido | 200 / 400 / 404          |
| `DELETE` | `/pedidos/{order_id}`        | Remove pedido             | 200 / 404                |

Documentação interativa disponível em: **http://localhost:8000/docs**

---

## Máquina de estados

```
RECEIVED → CONFIRMED → DISPATCHED → DELIVERED
    ↓           ↓           ↓
  CANCELED   CANCELED    CANCELED
```

- Todo pedido criado começa como `RECEIVED`
- A progressão de estados é sempre para frente (não é possível voltar)
- É possível cancelar em qualquer estado antes de `DELIVERED`
- Pedidos `DELIVERED` ou `CANCELED` são estados finais — nenhuma transição é permitida

---

## Arquitetura e decisões técnicas

### Backend — FastAPI + SQLite

Optou-se por **FastAPI** pela tipagem nativa com Pydantic, geração automática de documentação (Swagger) e alta performance. O banco de dados escolhido foi **SQLite** via SQLAlchemy, adequado para o escopo do desafio sem necessidade de infraestrutura adicional.

A arquitetura segue separação de responsabilidades em camadas:

- **Router**: recebe a requisição HTTP e delega
- **Service**: contém as regras de negócio (validação de estados)
- **Repository**: abstrai o acesso ao banco de dados
- **Models/Schemas**: definem a estrutura de dados no banco e na API

O `raw_data` (JSON completo do pedido) é persistido junto ao registro para preservar toda a estrutura original do `pedidos.json`, incluindo itens, pagamentos, histórico de statuses e endereço — sem perda de informação.

**Hipótese assumida**: o campo `pedidos.json` é a fonte de verdade inicial. Na primeira execução, os dados são importados automaticamente para o banco. Após isso, o banco é a fonte de verdade.

### Frontend — React + Chakra UI

Interface construída com **React** e **Chakra UI v3**, focada em usabilidade. As principais funcionalidades são:

- Visualização dos pedidos em cards com status colorido
- Alteração de status (confirmar, enviar, entregar, cancelar)
- Modal de criação de novo pedido com cálculo automático do total
- Confirmação de exclusão para pedidos finalizados

### Testes

Testes unitários com **pytest** cobrindo os cenários críticos da máquina de estados: fluxo padrão, cancelamentos permitidos e transições inválidas.

**Via Docker (com os containers rodando):**

```bash
docker compose exec api pytest
```

**Localmente:**

```bash
cd backend
pip install -r requirements.txt
pytest tests/
```

Saída esperada:

```
tests/test_service.py ....                        [100%]
4 passed in 0.XXs
```

---

## Tecnologias utilizadas

| Camada   | Tecnologia                       |
| -------- | -------------------------------- |
| Backend  | Python 3.12, FastAPI, SQLAlchemy |
| Banco    | SQLite                           |
| Frontend | React, TypeScript, Chakra UI v3  |
| Testes   | pytest                           |
| Deploy   | Docker, Docker Compose           |
