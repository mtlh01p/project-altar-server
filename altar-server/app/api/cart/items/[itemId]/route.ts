import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";

interface Params {
  params: { itemId: string };
}

export async function DELETE(_req: Request, { params }: Params) {
  const { itemId } = params;
  const res = await apiFetch(`/cart/items/${itemId}`, { method: "DELETE" });

  if (!res.ok) return NextResponse.json({ error: "Failed to remove item" }, { status: res.status });
  const data = await res.json();
  return NextResponse.json(data);
}
