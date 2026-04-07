import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const userCookie = request.cookies.get("user")?.value;
  const { pathname } = request.nextUrl;

  const protectedPaths = [
    "/dashboard",
    "/users",
    "/inventory",
    "/settings",
    "/profile",
    "/checkout",
  ];
  const isAdminPage = protectedPaths.some((path) => pathname.startsWith(path));

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAdminPage && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const onlyAdminPaths = ["/dashboard", "/users", "/inventory", "/settings"];
  const isStrictAdminPath = onlyAdminPaths.some((path) =>
    pathname.startsWith(path),
  );

  if (isStrictAdminPath && token) {
    try {
      if (!userCookie)
        return NextResponse.redirect(new URL("/login", request.url));

      const userData = JSON.parse(decodeURIComponent(userCookie));

      if (userData.role?.toLowerCase() !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error("Middleware Cookie Parse Error:", error);
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      response.cookies.delete("user");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
