from pydantic import BaseModel
from typing import List, Optional, Any
from enum import Enum


class StatusName(str, Enum):
    RECEIVED = "RECEIVED"
    CONFIRMED = "CONFIRMED"
    DISPATCHED = "DISPATCHED"
    DELIVERED = "DELIVERED"
    CANCELED = "CANCELED"


class StatusEntry(BaseModel):
    name: StatusName
    created_at: int
    order_id: Optional[str] = None
    origin: str = "STORE"


class OrderItem(BaseModel):
    code: Optional[int] = None
    name: str
    quantity: int
    price: float
    total_price: float
    observations: Optional[str] = None
    discount: Optional[float] = 0
    condiments: Optional[List[Any]] = []


class Payment(BaseModel):
    origin: str
    value: float
    prepaid: bool = True


class DeliveryCoordinates(BaseModel):
    latitude: float
    longitude: float
    id: Optional[int] = None


class DeliveryAddress(BaseModel):
    street_name: str
    street_number: str
    neighborhood: str
    city: str = "Brasília"
    state: str = "DF"
    postal_code: str = "00000000"
    country: str = "BR"
    reference: Optional[str] = None
    coordinates: Optional[DeliveryCoordinates] = None


class StoreInfo(BaseModel):
    id: str
    name: str


class Customer(BaseModel):
    name: str
    temporary_phone: Optional[str] = None


class OrderDetails(BaseModel):
    order_id: str
    last_status_name: StatusName = StatusName.RECEIVED
    total_price: float
    created_at: Optional[int] = None
    customer: Customer
    store: Optional[StoreInfo] = None
    items: List[OrderItem]
    payments: List[Payment] = []
    delivery_address: Optional[DeliveryAddress] = None
    statuses: List[StatusEntry] = []


class OrderContainer(BaseModel):
    store_id: str
    order_id: str
    order: OrderDetails


class CriarPedidoRequest(BaseModel):
    store_id: str
    order_id: str
    order: OrderDetails
