import type { Inventory } from "./types"
export async function fetchInventories(): Promise<Inventory[]> {
  const res = await fetch("/api/inventory", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch inventories");
  const data = await res.json();
  return data.inventories ?? [];
}

// Create a new inventory
export async function createInventory(payload: {
  name: string;
  ownerUserId: string;
}): Promise<Inventory> {
  const res = await fetch("/api/inventory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || "Failed to create inventory");
  }
  return res.json();
}

// Update an existing inventory
export async function updateInventory(
  id: number,
  payload: Partial<{ name: string; }>
): Promise<Inventory> {
  const res = await fetch(`/api/inventory/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || "Failed to update inventory");
  }
  return res.json();
}

// Delete an inventory
export async function deleteInventory(id: number): Promise<{ message: string }> {
  const res = await fetch(`/api/inventory/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || "Failed to delete inventory");
  }
  return res.json();
}

