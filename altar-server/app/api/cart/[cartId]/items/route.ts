import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";

interface Params {
  params: { cartId: string };
}

export async function GET(_req: Request, { params }: Params) {
  const { cartId } = params;

  const res = await apiFetch(`/cart/${cartId}/items`, { method: "GET" });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    return NextResponse.json({ error: "Failed to fetch cart items", details: errorData }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: Request, { params }: Params) {
  const { cartId } = params;
  const body = await req.json();

  const res = await apiFetch(`/cart/${cartId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    return NextResponse.json({ error: "Failed to add item", details: errorData }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
