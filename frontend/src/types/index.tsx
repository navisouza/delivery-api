export enum StatusName {
  RECEIVED = "RECEIVED",
  CONFIRMED = "CONFIRMED",
  DISPATCHED = "DISPATCHED",
  DELIVERED = "DELIVERED",
  CANCELED = "CANCELED",
}

export interface OrderItem {
  code?: number;
  name: string;
  quantity: number;
  price: number;
  total_price: number;
  observations?: string | null;
  condiments?: any[];
}

export interface Payment {
  origin: string;
  value: number;
  prepaid: boolean;
}

export interface DeliveryAddress {
  street_name: string;
  street_number: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  reference?: string;
}

export interface Customer {
  name: string;
  temporary_phone?: string;
}

export interface Store {
  id: string;
  name: string;
}

export interface OrderDetails {
  order_id: string;
  last_status_name: StatusName;
  total_price: number;
  created_at: number;
  customer: Customer;
  store?: Store;
  items: OrderItem[];
  payments: Payment[];
  delivery_address?: DeliveryAddress;
  statuses: {
    name: StatusName;
    created_at: number;
    order_id: string;
    origin: string;
  }[];
}

export interface Order {
  store_id: string;
  order_id: string;
  order: OrderDetails;
}
