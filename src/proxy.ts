import { NextResponse, type NextRequest } from "next/server";
import { CV_HREF } from "@/lib/site-identity";

const SKIP_PREFIXES = ["/_next", "/api"];

function hasFileExtension(pathname: string): boolean {
  const last = pathname.split("/").pop() ?? "";
  return last.includes(".");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (hasFileExtension(pathname)) {
    return NextResponse.next();
  }

  const lower = pathname.toLowerCase();

  if (lower === "/cv" || lower === "/resume") {
    return NextResponse.redirect(CV_HREF, 302);
  }

  const projectsMatch = lower.match(/^\/projects?\/(.*)$/);
  if (projectsMatch) {
    const url = request.nextUrl.clone();
    url.pathname = `/${projectsMatch[1]}`;
    return NextResponse.redirect(url, 308);
  }

  if (pathname !== lower) {
    const url = request.nextUrl.clone();
    url.pathname = lower;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)",
  ],
};
