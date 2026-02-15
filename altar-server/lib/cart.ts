import { Cart, CartItem } from "./types";

// Get current carts
export async function getCarts() {
  const res = await fetch("/api/cart", { method: "GET", headers: { "Content-Type": "application/json" }, });
  if (!res.ok) throw new Error("Failed to fetch carts");
  const data = await res.json();
  return data.cart ?? [];
}

// Create a new cart
export async function createCart(payload: {
  cartName: string;
  ownerUserId: string;
}): Promise<Cart> {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || "Failed to create cart");
  }
  return res.json();
}


export async function fetchCartItems(cartId: string) {
  const res = await fetch(`/api/cart/${cartId}/items`);
  return res.json();
}

export async function addCartItem(cartId: string, productId: string) {
  await fetch(`/api/cart/${cartId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
}

export async function removeCartItem(itemId: number) {
  await fetch(`/api/cart/items/${itemId}`, {
    method: "DELETE",
  });
}
