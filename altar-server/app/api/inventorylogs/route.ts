import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { cookies } from "next/headers";

// To add, fetch, and filter inventory logs

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value || "";
  const { searchParams } = new URL(req.url);
  const params = new URLSearchParams(searchParams);
  const response = await apiFetch(`/inventory-logs?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch inventory logs" },
      { status: response.status }
    );
  }
  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value || "";
  const response = await apiFetch("/inventory-logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json();
    return NextResponse.json(
      { error: "Failed to create inventory log", details: errorData },
      { status: response.status }
    );
  }
  const data = await response.json();
  return NextResponse.json(data);
}

