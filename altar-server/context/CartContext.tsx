"use client"
import React, { createContext, useContext, useState } from "react"
import { Product } from "@/lib/types"

type CartItem = Product & { quantity: number }

type CartState = {
  carts: Record<string, CartItem[]>
  addToCart: (inventoryId: string, product: Product) => void
  updateQuantity: (inventoryId: string, productId: string, qty: number) => void
  clearCart: (inventoryId: string) => void
}

const CartContext = createContext<CartState | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [carts, setCarts] = useState<Record<string, CartItem[]>>({})

  const addToCart = (inventoryId: string, product: Product) => {
    setCarts(prev => {
      const cart = prev[inventoryId] || []
      const existing = cart.find(i => i.productId === product.productId)

      let updatedCart
      if (existing) {
        updatedCart = cart.map(i =>
          i.productId === product.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      } else {
        updatedCart = [...cart, { ...product, quantity: 1 }]
      }

      return { ...prev, [inventoryId]: updatedCart }
    })
  }

  const updateQuantity = (inventoryId: string, productId: string, qty: number) => {
    setCarts(prev => {
      const cart = prev[inventoryId] || []
      const updated = qty <= 0
        ? cart.filter(i => i.productId !== productId)
        : cart.map(i => i.productId === productId ? { ...i, quantity: qty } : i)

      return { ...prev, [inventoryId]: updated }
    })
  }

  const clearCart = (inventoryId: string) => {
    setCarts(prev => ({ ...prev, [inventoryId]: [] }))
  }

  return (
    <CartContext.Provider value={{ carts, addToCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}
