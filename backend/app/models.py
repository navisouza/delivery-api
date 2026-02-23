import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, JSON, Enum as SQLEnum, DateTime
from .database import Base


class StatusPedido(str, enum.Enum):
    RECEIVED = "RECEIVED"
    CONFIRMED = "CONFIRMED"
    DISPATCHED = "DISPATCHED"
    DELIVERED = "DELIVERED"
    CANCELED = "CANCELED"


class PedidoDB(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, unique=True, index=True)
    store_id = Column(String, index=True)
    customer_name = Column(String)
    customer_phone = Column(String)
    total_price = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(SQLEnum(StatusPedido), default=StatusPedido.RECEIVED)
    delivery_city = Column(String)
    delivery_neighborhood = Column(String)
    raw_data = Column(JSON)
