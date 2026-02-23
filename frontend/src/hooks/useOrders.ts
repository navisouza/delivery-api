import { useState, useEffect, useCallback } from "react";
import { Order, StatusName } from "../types";

const API_URL = "http://localhost:8000/pedidos";

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Erro ao buscar pedidos");

      const data: Order[] = await response.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = async (orderId: string, newStatus: StatusName) => {
    try {
      const response = await fetch(
        `${API_URL}/${orderId}/status?novo_status=${newStatus}`,
        { method: "PATCH" },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro ao atualizar status");
      }

      await fetchOrders();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createOrder = async (orderData: any) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error("Erro ao criar pedido");
      await fetchOrders();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`${API_URL}/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro ao excluir pedido");
      }

      await fetchOrders();
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, updateStatus, createOrder, deleteOrder };
};
