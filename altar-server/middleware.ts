import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token");

  const protectedPaths = ["/welcome", "/dashboard", "/volunteering", "/inventory", "/pos", "/cart"];

  if (
    protectedPaths.some((path) =>
      req.nextUrl.pathname.startsWith(path)
    ) &&
    !token
  ) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }
}

export const config = {
  matcher: ["/welcome/:path*", "/dashboard/:path*", "/volunteering/:path*", "/inventory/:path*", "/pos/:path*", "/cart/:path*"],
};
