import { NextResponse } from "next/server";

export function proxy(request) {
  const token = request.cookies.get("token")?.value;
  const userCookie = request.cookies.get("user")?.value;
  const { pathname } = request.nextUrl;

  const isAdminPage =
    pathname === "/" ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/setting") ||
    pathname.startsWith("/profile");

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  const isShopPage = pathname.startsWith("/shop");

  if (isAdminPage && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token) {
    if (isAuthPage) {
      return NextResponse.redirect(new URL("/shop/home", request.url));
    }

    if (isAdminPage) {
      try {
        if (!userCookie) {
          return NextResponse.redirect(new URL("/shop/home", request.url));
        }

        const decoded = decodeURIComponent(userCookie);
        const userData = JSON.parse(decoded);

        if (userData.role?.toLowerCase() !== "admin") {
          return NextResponse.redirect(new URL("/shop/home", request.url));
        }
      } catch (e) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
