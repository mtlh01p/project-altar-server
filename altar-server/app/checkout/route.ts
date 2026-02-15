import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value || "";

  try {
    const body = await req.json();
    const { cartId, items } = body; // items = [{id, productId, quantity, price, productStock}]

    if (!cartId || !items?.length) {
      return NextResponse.json({ error: "No cart or items provided" }, { status: 400 });
    }

    // 1️⃣ Calculate total and collect product IDs
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const productIds = items.map((i) => i.productId);

    // 2️⃣ Create transaction via the frontend transactions API
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
          userId: token || null,
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

