import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const userCookie = request.cookies.get("user")?.value;
  const { pathname } = request.nextUrl;

  const authPaths = ["/login", "/register"];
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  const adminStrictPaths = ["/dashboard", "/users", "/inventory", "/settings"];
  const isStrictAdminPath = adminStrictPaths.some((path) =>
    pathname.startsWith(path),
  );

  const generalProtectedPaths = ["/profile", "/checkout"];
  const isProtectedPage =
    isStrictAdminPath ||
    generalProtectedPaths.some((path) => pathname.startsWith(path));

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isProtectedPage && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isStrictAdminPath && token) {
    try {
      if (!userCookie) {
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.delete("token");
        return response;
      }

      const userData = JSON.parse(decodeURIComponent(userCookie));

      if (userData.role?.toLowerCase() !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error("Middleware Auth Error:", error);
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("token");
      response.cookies.delete("user");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
