// lib/products.ts
import { apiFetch } from "./api";

// Fetch all products for a given inventory
export async function getProductsByInventory(inventoryId: string) {
  if (!inventoryId) return [];
  const res = await apiFetch(`/api/products/inventory/${inventoryId}`, {
    method: "GET",
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

// Fetch a single product
export async function getProduct(productId: string) {
  const res = await apiFetch(`/api/products/${productId}`, {
    method: "GET",
  });
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

// Create a new product
export async function createProduct(data: any) {
  const res = await apiFetch("/api/products", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

// Update a product
export async function updateProduct(productId: string, data: any) {
  const res = await apiFetch(`/api/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
  //Show HTML error
  if (!res.ok) {
    const contentType = res.headers.get("content-type");
    let errorData;
    if (contentType && contentType.includes("application/json")) {
      errorData = await res.json();
    }
    else {
      errorData = await res.text();
      console.error("Backend returned HTML instead of JSON:", errorData);
    }
    throw new Error(errorData.error || "Failed to update product");
  }
  return res.json();
}

// Delete a product
export async function deleteProduct(productId: string) {
  const res = await apiFetch(`/api/products/${productId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.json();
}
