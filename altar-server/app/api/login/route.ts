import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();

    const res = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: 401 });
  }

  (await cookies()).set("access_token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({ user: data.user });
}
