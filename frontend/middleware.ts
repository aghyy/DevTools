import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: "/:path*", // Apply middleware to all routes
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("jwt")?.value;
  const publicRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/favicon",
    "/_next",
    "/images",
  ];
  const pathname = req.nextUrl.pathname;

  // Allow access to public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // If no token is present, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    // Decode and validate the token
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(Buffer.from(base64Payload, "base64").toString("utf-8"));

    // Check if token is expired
    if (payload.exp * 1000 < Date.now()) {
      throw new Error("Token expired");
    }

    // Redirect authenticated users from `/` to `/dashboard`
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Allow access to other routes
    return NextResponse.next();
  } catch (err) {
    console.log("Authentication error:", err);

    // Redirect to login if token is invalid or expired
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}