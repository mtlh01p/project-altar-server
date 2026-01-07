import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();

  const res = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: 400 });
  }
  return NextResponse.json({ message: "Registration successful" });
}
