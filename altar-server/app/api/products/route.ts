import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { cookies } from "next/headers";

// To create, read, update, and delete products

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value || "";
  const response = await apiFetch("/api/products", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) { 
    return NextResponse.json(
      { error: "Failed to fetch products" },
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
  const response = await apiFetch("/api/products/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
if (!response.ok) {
  const contentType = response.headers.get("content-type");
  let errorData;
  
  if (contentType && contentType.includes("application/json")) {
    errorData = await response.json();
  } else {
    errorData = await response.text(); // Get the HTML text instead of crashing
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


