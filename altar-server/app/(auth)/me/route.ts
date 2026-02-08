import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const response = await apiFetch("/api/auth/me", {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` },
  });

  return NextResponse.json(await response.json());
}