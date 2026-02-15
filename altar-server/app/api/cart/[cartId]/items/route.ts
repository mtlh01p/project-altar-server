import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  context: { params: Promise<{ cartId: string }> }
) {
  const { cartId } = await context.params; // ✅ FIX

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value || "";

  const res = await apiFetch(`/api/cart/${cartId}/items`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}


export async function POST(
  req: Request,
  context: { params: Promise<{ cartId: string }> }
) {
  const { cartId } = await context.params; // ✅ FIX
  const body = await req.json();

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value || "";

  const res = await apiFetch(`/api/cart/${cartId}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
