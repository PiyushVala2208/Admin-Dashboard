import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const userCookie = request.cookies.get("user")?.value;
  const { pathname } = request.nextUrl;

  const isAdminPage = [
    "/dashboard",
    "/users",
    "/inventory",
    "/settings",
    "/profile",
  ].some((path) => pathname.startsWith(path));

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAdminPage && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdminPage && token) {
    try {
      if (!userCookie) throw new Error("No User Info");

      const userData = JSON.parse(decodeURIComponent(userCookie));

      if (userData.role?.toLowerCase() !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
