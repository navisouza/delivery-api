import time
from sqlalchemy.orm import Session
from .models import PedidoDB, StatusPedido
from .schemas import StatusName


class PedidoRepository:
    def __init__(self, db: Session):
        self.db = db

    def _to_response(self, pedido: PedidoDB) -> dict:
        """
        Retorna o raw_data completo (com items, payments, delivery_address, store, statuses)
        sincronizando o last_status_name com o valor atual da coluna `status` no banco.
        """
        data = dict(pedido.raw_data)
        data["order"] = dict(data.get("order", {}))
        data["order"]["last_status_name"] = pedido.status.value
        return data

    def listar(self) -> list[dict]:
        pedidos = self.db.query(PedidoDB).order_by(PedidoDB.created_at.desc()).all()
        return [self._to_response(p) for p in pedidos]

    def buscar_por_id(self, order_id: str) -> PedidoDB | None:
        return self.db.query(PedidoDB).filter(PedidoDB.order_id == order_id).first()

    def criar(self, raw_data: dict) -> dict:
        order_data = raw_data["order"]
        if not order_data.get("created_at"):
            order_data["created_at"] = int(time.time() * 1000)
        novo = PedidoDB(
            order_id=raw_data["order_id"],
            store_id=raw_data["store_id"],
            customer_name=order_data["customer"]["name"],
            customer_phone=order_data["customer"].get("temporary_phone"),
            total_price=order_data["total_price"],
            status=StatusPedido.RECEIVED,
            delivery_city=order_data.get("delivery_address", {}).get("city", ""),
            delivery_neighborhood=order_data.get("delivery_address", {}).get(
                "neighborhood", ""
            ),
            raw_data=raw_data,
        )
        self.db.add(novo)
        self.db.commit()
        self.db.refresh(novo)
        return self._to_response(novo)

    def atualizar_status(self, order_id: str, novo_status: StatusName) -> dict:
        pedido = self.buscar_por_id(order_id)

        pedido.status = StatusPedido(novo_status.value)

        nova_entrada = {
            "name": novo_status.value,
            "created_at": int(time.time() * 1000),
            "order_id": order_id,
            "origin": "STORE",
        }
        raw = dict(pedido.raw_data)
        raw["order"] = dict(raw.get("order", {}))
        raw["order"]["last_status_name"] = novo_status.value
        raw["order"]["statuses"] = list(raw["order"].get("statuses", [])) + [
            nova_entrada
        ]
        pedido.raw_data = raw

        self.db.commit()
        self.db.refresh(pedido)
        return self._to_response(pedido)

    def excluir(self, order_id: str) -> bool:
        pedido = self.buscar_por_id(order_id)
        if not pedido:
            return False
        self.db.delete(pedido)
        self.db.commit()
        return True
