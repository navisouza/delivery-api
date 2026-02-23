import json
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, SessionLocal, Base
from .models import PedidoDB
from .router import router as pedidos_router


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Coco Bambu Delivery API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def popular_banco_inicial():
    db = SessionLocal()
    try:
        if db.query(PedidoDB).count() == 0:
            path_json = "data/pedidos.json"
            if os.path.exists(path_json):
                with open(path_json, "r", encoding="utf-8") as f:
                    dados = json.load(f)
                    for item in dados:
                        order_data = item["order"]
                        novo_pedido = PedidoDB(
                            order_id=item["order_id"],
                            store_id=item["store_id"],
                            customer_name=order_data["customer"]["name"],
                            customer_phone=order_data["customer"]["temporary_phone"],
                            total_price=order_data["total_price"],
                            status=order_data["last_status_name"],
                            delivery_city=order_data["delivery_address"]["city"],
                            delivery_neighborhood=order_data["delivery_address"][
                                "neighborhood"
                            ],
                            raw_data=item,
                        )
                        db.add(novo_pedido)
                db.commit()
    finally:
        db.close()


app.include_router(pedidos_router)
