import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { cookies } from "next/headers";

interface Params {
  params: { id: string };
}

export async function PUT(req: Request, { params }: Params) {
  const body = await req.json();
  const id = params.id;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value || "";

  const response = await apiFetch(`/inventory/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return NextResponse.json(
      { error: "Failed to update inventory item", details: errorData },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function DELETE(req: Request, { params }: Params) {
  const id = params.id;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value || "";

  const response = await apiFetch(`/inventory/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    return NextResponse.json(
      { error: "Failed to delete inventory item", details: errorData },
      { status: response.status }
    );
  }

  return NextResponse.json({ message: "Inventory item deleted successfully" });
}
