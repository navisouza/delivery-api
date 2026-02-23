from .schemas import StatusName


def validar_proximo_passo(status_atual: StatusName, novo_status: StatusName):
    if novo_status == StatusName.CANCELED:
        if status_atual == StatusName.DELIVERED:
            raise ValueError("Não é possível cancelar um pedido já entregue.")
        return True

    fluxo = {
        StatusName.RECEIVED: [StatusName.CONFIRMED],
        StatusName.CONFIRMED: [StatusName.DISPATCHED],
        StatusName.DISPATCHED: [StatusName.DELIVERED],
        StatusName.DELIVERED: [],
        StatusName.CANCELED: [],
    }

    if novo_status not in fluxo.get(status_atual, []):
        raise ValueError(f"Mudança de status inválida: {status_atual} -> {novo_status}")
    return True
