import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value || "";

  try {
    const body = await req.json();
    const { productIds, total, userId, inventoryId } = body;

    if (!productIds || !Array.isArray(productIds) || !total) {
      return NextResponse.json(
        { error: "Missing required fields: productIds, total" },
        { status: 400 }
      );
    }

    // Call backend to create transaction
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const res = await fetch(`${backendUrl}/api/transactions/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        productIds,
        total,
        userId: userId || null,
        inventoryId: inventoryId || null,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Backend error:", error);
      return NextResponse.json(
        { error: error || "Failed to create transaction" },
        { status: res.status }
      );
    }

    const transaction = await res.json();
    return NextResponse.json({ transaction });
  } catch (err) {
    console.error("Transaction creation error:", err);
    return NextResponse.json(
      { error: "Transaction creation failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value || "";
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const query = userId ? `?userId=${userId}` : "";
    
    console.log(`Fetching transactions from: ${backendUrl}/api/transactions${query}`);
    
    const res = await fetch(`${backendUrl}/api/transactions${query}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    console.log("Backend response:", data);
    
    const transactions = Array.isArray(data) ? data : (data?.transactions || []);
    console.log("Extracted transactions:", transactions);
    
    return NextResponse.json({ transactions });
  } catch (err) {
    console.error("Fetch transactions error:", err);
    return NextResponse.json(
      { transactions: [], error: String(err) },
      { status: 200 }
    );
  }
}
