# 📋 Backlog — Delivery API (Coco Bambu)

Tarefas ordenadas por sequência de execução, do planejamento ao deploy.

---

## ✅ CONCLUÍDO

---

### 1. Modelagem de dados e banco
**Critérios de aceitação:**
- Modelo `PedidoDB` criado com todos os campos necessários (order_id, store_id, customer_name, customer_phone, total_price, status, delivery_city, delivery_neighborhood, raw_data)
- Banco SQLite configurado via SQLAlchemy
- Enum `StatusPedido` com os 5 estados definidos no desafio

---

### 2. Seed automático do banco a partir do `pedidos.json`
**Critérios de aceitação:**
- Na inicialização, se o banco estiver vazio, os dados do `pedidos.json` são importados automaticamente
- O `raw_data` completo é preservado para cada pedido

---

### 3. Schemas de validação com Pydantic
**Critérios de aceitação:**
- Schemas criados para: `Customer`, `OrderItem`, `Payment`, `DeliveryAddress`, `OrderDetails`, `CriarPedidoRequest`
- Enum `StatusName` disponível para validação de entrada
- Campos opcionais devidamente marcados para compatibilidade com dados existentes

---

### 4. Máquina de estados — service layer
**Critérios de aceitação:**
- Função `validar_proximo_passo(status_atual, novo_status)` implementada
- Transições permitidas: `RECEIVED→CONFIRMED`, `CONFIRMED→DISPATCHED`, `DISPATCHED→DELIVERED`
- Cancelamento permitido em: `RECEIVED`, `CONFIRMED`, `DISPATCHED`
- Cancelamento bloqueado em: `DELIVERED`
- Estados finais (`DELIVERED`, `CANCELED`) não aceitam nenhuma transição

---

### 5. Repository — acesso a dados
**Critérios de aceitação:**
- Métodos implementados: `listar()`, `buscar_por_id()`, `criar()`, `atualizar_status()`, `excluir()`
- `atualizar_status` persiste a nova entrada no histórico de `statuses` dentro do `raw_data`
- `_to_response` sincroniza o `last_status_name` do `raw_data` com o valor real do banco

---

### 6. Endpoints REST
**Critérios de aceitação:**
- `GET /pedidos/` — lista todos os pedidos com dados completos
- `GET /pedidos/{order_id}` — retorna pedido específico ou 404
- `POST /pedidos/` — cria pedido com status inicial `RECEIVED`, retorna 201; retorna 409 se order_id já existe
- `PATCH /pedidos/{order_id}/status` — atualiza status com validação da máquina de estados; retorna 400 para transição inválida
- `DELETE /pedidos/{order_id}` — remove pedido ou retorna 404
- Todos os endpoints seguem padrão REST com JSON

---

### 7. Testes unitários
**Critérios de aceitação:**
- Cobertura dos cenários: fluxo padrão completo, cancelamentos permitidos, transições inválidas (voltar estado), cancelar pedido entregue
- Testes isolados, sem dependência de banco ou HTTP
- Fácil de estender para novos cenários

---

### 8. Frontend — visualização de pedidos
**Critérios de aceitação:**
- Cards exibem: nome do cliente, ID curto, loja, status colorido, itens, endereço, forma de pagamento, total
- Status exibido com badge colorido por estado
- Ações contextuais por status (só aparece o botão correto para cada estado)

---

### 9. Frontend — criação de pedido
**Critérios de aceitação:**
- Modal com campos: nome/telefone do cliente, itens (nome, quantidade, preço), endereço, forma de pagamento
- Total calculado automaticamente a partir dos itens
- Pedido enviado para a API ao confirmar

---

### 10. Frontend — atualização e exclusão
**Critérios de aceitação:**
- Botões de ação chamam a API corretamente e atualizam a lista
- Exclusão disponível apenas para pedidos finalizados (`DELIVERED` ou `CANCELED`)
- Confirmação de exclusão via dialog

---

### 11. Conteinerização com Docker
**Critérios de aceitação:**
- `Dockerfile` funcional para o backend (FastAPI + Uvicorn)
- `Dockerfile` funcional para o frontend (React)
- `docker-compose.yml` orquestra os dois serviços com hot-reload em desenvolvimento
- Volume compartilhado para persistência do banco SQLite

---

### 12. Documentação (README + Backlog)
**Critérios de aceitação:**
- README com: descrição do projeto, pré-requisitos, passo a passo de execução, estrutura de pastas, lista de endpoints, diagrama da máquina de estados, decisões de arquitetura e hipóteses assumidas
- Backlog com tarefas ordenadas por execução e critérios de aceitação por tarefa

---

## 🔮 MELHORIAS FUTURAS (fora do escopo do desafio)

| Tarefa | Motivação |
|--------|-----------|
| Paginação no `GET /pedidos/` | Performance com grande volume de dados |
| Filtro por status/loja/data | Usabilidade operacional |
| Autenticação JWT | Segurança em ambiente de produção |
| Websocket para atualização em tempo real | Melhor UX sem necessidade de polling |
| Migração para PostgreSQL | Escalabilidade além do SQLite |
| CI/CD com GitHub Actions | Automatizar testes e deploy |