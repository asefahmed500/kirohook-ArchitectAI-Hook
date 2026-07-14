/**
 * OrderService - Manages orders, payments, and order lifecycle.
 */
export class OrderService {
  private orders: Map<number, Order> = new Map();
  private nextId = 1;

  async createOrder(data: CreateOrderDto): Promise<Order> {
    const order: Order = {
      id: this.nextId++,
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.orders.set(order.id, order);
    return order;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return [...this.orders.values()].filter((o) => o.userId === userId);
  }

  async updateOrderStatus(id: number, status: Order['status']): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) throw new Error('Order not found');
    const updated = { ...order, status };
    this.orders.set(id, updated);
    return updated;
  }
}

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface CreateOrderDto {
  userId: number;
  items: OrderItem[];
  total: number;
}
