import { apiFetch } from "./api";

export async function getCarts() {
  const res = await apiFetch("/api/cart", { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch carts");
  return res.json();
}

export async function createCart(userId?: string) {
  const res = await apiFetch("/api/cart", {
    method: "POST",
    body: JSON.stringify({ userId }),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to create cart");
  return res.json();
}

export async function addItemToCart(cartId: number, productId: string, quantity = 1) {
  const res = await apiFetch(`/api/cart/${cartId}/items`, {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to add item to cart");
  return res.json();
}

export async function getCartItems(cartId: number) {
  const res = await apiFetch(`/api/cart/${cartId}/items`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch cart items");
  return res.json();
}

export async function removeCartItem(itemId: number) {
  const res = await apiFetch(`/api/cart/items/${itemId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to remove cart item");
  return res.json();
}
