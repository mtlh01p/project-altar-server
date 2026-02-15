// lib/transactions.ts
export async function createTransaction(data: {
  productIds: string[];
  total: number;
  userId?: string;
}) {
  const res = await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create transaction");
  }

  return res.json();
}

export async function checkoutCart(cartId: string, items: any[]) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartId, items }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Checkout failed");
  }

  return res.json();
}

export async function getTransactions(userId?: string) {
  const query = userId ? `?userId=${userId}` : "";
  const res = await fetch(`/api/transactions${query}`);
  if (!res.ok) {
    throw new Error("Failed to fetch transactions");
  }
  return res.json();
}

