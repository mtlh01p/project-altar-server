import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { cookies } from "next/headers";

interface Params {
  params: { productId: string };
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId: id } = await params;  // 👈 await it
  const body = await req.json();

  const response = await apiFetch(`/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  const response = await apiFetch(`/api/products/${productId}`, {
    method: "DELETE",
  });

  //Error in HTML
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    let errorData;
    if (contentType && contentType.includes("application/json")) {
      errorData = await response.json();
    }
    else {
      errorData = await response.text();
      console.error("Backend returned HTML instead of JSON:", errorData);
    }
    return NextResponse.json(
      { error: "Backend error", details: errorData },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}