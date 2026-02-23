import pytest

from app.services import validar_proximo_passo
from app.schemas import StatusName


def test_fluxo_padrao_sucesso():
    """Testa o caminho feliz do pedido"""
    assert validar_proximo_passo(StatusName.RECEIVED, StatusName.CONFIRMED) is True
    assert validar_proximo_passo(StatusName.CONFIRMED, StatusName.DISPATCHED) is True
    assert validar_proximo_passo(StatusName.DISPATCHED, StatusName.DELIVERED) is True


def test_cancelamento_permitido():
    """Testa se pode cancelar em estados iniciais"""
    assert validar_proximo_passo(StatusName.RECEIVED, StatusName.CANCELED) is True
    assert validar_proximo_passo(StatusName.CONFIRMED, StatusName.CANCELED) is True
    assert validar_proximo_passo(StatusName.DISPATCHED, StatusName.CANCELED) is True


def test_erro_ao_voltar_status():
    """Testa se a máquina impede voltar estados (ex: de Enviado para Recebido)"""
    with pytest.raises(ValueError, match="Mudança de status inválida"):
        validar_proximo_passo(StatusName.DISPATCHED, StatusName.RECEIVED)


def test_erro_cancelar_pedido_entregue():
    """Testa a regra específica: não pode cancelar se já foi entregue"""
    with pytest.raises(
        ValueError, match="Não é possível cancelar um pedido já entregue"
    ):
        validar_proximo_passo(StatusName.DELIVERED, StatusName.CANCELED)
