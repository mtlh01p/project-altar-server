import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value || "";

  try {
    const body = await req.json();
    const { cartId, items } = body; // items = [{id, productId, quantity, price, productStock}]

    if (!cartId || !items?.length) {
      return NextResponse.json({ error: "No cart or items provided" }, { status: 400 });
    }


    // 1️⃣ Calculate total and collect product IDs (repeat for quantity)
    type CheckoutItem = { id: string; productId: string; quantity: number; price: number; productStock: number; inventoryId?: string };
    const total = (items as CheckoutItem[]).reduce((sum, i) => sum + i.price * i.quantity, 0);
    const productIds: string[] = [];
    let inventoryId: string | null = null;
    for (const i of items) {
      for (let q = 0; q < i.quantity; q++) {
        productIds.push(i.productId);
      }
      if (!inventoryId && i.inventoryId) inventoryId = i.inventoryId;
    }

    // 2️⃣ Get current user and create transaction via the frontend transactions API
    let userId = null;
    try {
      const user = await getCurrentUser();
      userId = user?.user?.userId || user?.userId || null;
    } catch {
      userId = null;
    }
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000";
    const transactionUrl = `${baseUrl}/api/transactions`;
    console.log(`Calling transaction endpoint: ${transactionUrl}`);
    
    const createTransactionRes = await fetch(transactionUrl,
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          productIds,
          total,
          userId,
          inventoryId: inventoryId || (items[0]?.inventoryId ?? null),
        }),
      }
    );

    if (!createTransactionRes.ok) {
      let errorMsg = "Failed to create transaction";
      try {
        const error = await createTransactionRes.json();
        errorMsg = error.error || JSON.stringify(error);
      } catch {
        const text = await createTransactionRes.text();
        errorMsg = text || `HTTP ${createTransactionRes.status}`;
      }
      console.error("Transaction creation failed:", errorMsg);
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const transactionData = await createTransactionRes.json();
    const transaction = transactionData;

    // 3️⃣ Decrement product stock
    for (const item of items) {
      const newQty = Math.max(item.productStock - item.quantity, 0);
      try {
        await fetch(`http://localhost:5000/api/products/${item.productId}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ stock: newQty }),
        });
      } catch (err) {
        console.error(`Failed to update product stock for ${item.productId}:`, err);
      }
    }

    // 4️⃣ Delete cart items
    for (const item of items) {
      try {
        await fetch(`http://localhost:5000/api/cart/items/${item.id}`, { 
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error(`Failed to delete cart item ${item.id}:`, err);
      }
    }

    // 5️⃣ Delete cart itself
    try {
      await fetch(`http://localhost:5000/api/cart/${cartId}`, { 
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error(`Failed to delete cart ${cartId}:`, err);
    }

    return NextResponse.json({ transaction });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
