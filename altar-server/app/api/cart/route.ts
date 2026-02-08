import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value || "";

  const res = await apiFetch("/api/cart", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });

  if (!res.ok) return NextResponse.json({ error: "Failed to fetch carts" }, { status: res.status });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value || "";

  const res = await apiFetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!res.ok) return NextResponse.json({ error: "Failed to create cart" }, { status: res.status });
  const data = await res.json();
  return NextResponse.json(data);
}
