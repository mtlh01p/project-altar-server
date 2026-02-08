export type Product = {
  productId: string
  name: string,
    description: string
    stock: number
    price: number
    inventoryId: number
}

export type Cart = {
  cartId: number
  userId?: string
  created_at: string
}

export type CartItem = {
  itemId: number
  productId: string
  quantity: number
  added_at: string
}

export type InventoryLog = {
  id: number
  action: string
  timestamp: string
}

export interface Inventory {
  inventoryId: number;
  name: string;
  ownerUserId: string;
  created_at: string;
  description?: string;
}