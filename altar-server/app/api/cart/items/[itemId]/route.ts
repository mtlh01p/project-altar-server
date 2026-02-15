import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { cookies } from "next/headers";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  // In Next.js, params is a plain object (not a promise) in route handlers,
  // so you can use it directly without `await`.
  const { itemId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value || "";

  const res = await apiFetch(`/api/cart/items/${itemId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value || "";

  try {
    const body = await req.json(); // { quantity: number }
    const res = await apiFetch(`/api/cart/items/${itemId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity: body.quantity }),
    });

    if (!res.ok) {
const text = await res.text();
console.log("Server response:", text);
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}