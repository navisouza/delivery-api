import time
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from .database import get_db
from .repository import PedidoRepository
from .services import validar_proximo_passo
from .schemas import StatusName, CriarPedidoRequest

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


@router.get("/")
def listar_todos_pedidos(db: Session = Depends(get_db)):
    """
    Lista todos os pedidos com dados completos:
    items, payments, delivery_address, store, statuses.
    """
    repo = PedidoRepository(db)
    return repo.listar()


@router.get("/{order_id}")
def buscar_pedido_por_id(order_id: str, db: Session = Depends(get_db)):
    repo = PedidoRepository(db)
    pedido = repo.buscar_por_id(order_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return repo._to_response(pedido)


@router.post("/", status_code=201)
def criar_pedido(payload: CriarPedidoRequest, db: Session = Depends(get_db)):
    """
    Cria um novo pedido. Status inicial sempre RECEIVED.
    Já adiciona a entrada inicial em statuses no raw_data.
    """
    repo = PedidoRepository(db)

    if repo.buscar_por_id(payload.order_id):
        raise HTTPException(status_code=409, detail="order_id já cadastrado")

    now_ms = int(time.time() * 1000)
    order_dict = payload.order.model_dump()
    order_dict["last_status_name"] = StatusName.RECEIVED.value
    order_dict["statuses"] = [
        {
            "name": StatusName.RECEIVED.value,
            "created_at": now_ms,
            "order_id": payload.order_id,
            "origin": "STORE",
        }
    ]

    raw_data = {
        "store_id": payload.store_id,
        "order_id": payload.order_id,
        "order": order_dict,
    }

    return repo.criar(raw_data)


@router.patch("/{order_id}/status")
def atualizar_status_pedido(
    order_id: str, novo_status: StatusName, db: Session = Depends(get_db)
):
    """
    Altera o status do pedido validando a máquina de estados.
    Também persiste a mudança no histórico de statuses dentro do raw_data.
    """
    repo = PedidoRepository(db)

    pedido_db = repo.buscar_por_id(order_id)
    if not pedido_db:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    try:
        validar_proximo_passo(pedido_db.status, novo_status)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    pedido_atualizado = repo.atualizar_status(order_id, novo_status)

    return {
        "message": f"Pedido alterado de {pedido_db.status} para {novo_status}",
        "pedido": pedido_atualizado,
    }


@router.delete("/{order_id}")
def excluir_pedido(order_id: str, db: Session = Depends(get_db)):
    repo = PedidoRepository(db)
    sucesso = repo.excluir(order_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return {"message": "Pedido removido com sucesso"}
