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

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isAdminPage && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdminPage && token) {
    try {
      if (!userCookie) {
        console.log("User cookie missing, redirecting to home...");
        return NextResponse.redirect(new URL("/shop/home", request.url));
      }

      const decoded = decodeURIComponent(userCookie);
      const userData = JSON.parse(decoded);
      
      console.log("User Role:", userData.role);

      if (userData.role?.toLowerCase() !== "admin") {
        return NextResponse.redirect(new URL("/shop/home", request.url));
      }
    } catch (e) {
      console.error("Middleware Parse Error:", e.message);

      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};