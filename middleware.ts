import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Real role-based route protection for /student, /trainer, /admin
// (Phase 7 — previously a structural stub in middleware.ts from Phase 1).
const PROTECTED: { prefix: string; role: string }[] = [
  { prefix: "/student", role: "student" },
  { prefix: "/trainer", role: "trainer" },
  { prefix: "/admin", role: "admin" },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = PROTECTED.find((p) => pathname.startsWith(p.prefix));
  if (!match) return NextResponse.next();

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (!profile || profile.role !== match.role) {
    // Logged in, but wrong portal for their role — send them to their own.
    return NextResponse.redirect(new URL(`/${profile?.role ?? "login"}`, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/student/:path*", "/trainer/:path*", "/admin/:path*"],
};
