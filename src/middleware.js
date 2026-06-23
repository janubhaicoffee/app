import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req) {
  // 1. Admin & Secure API Route Protection
  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/ai/generate-article')) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Try to get user data which validates JWT on the server
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Optional: Check if user email is in superadmin list
    const adminEmails = (process.env.SUPERADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    if (!adminEmails.includes(user.email?.toLowerCase())) {
      return NextResponse.redirect(new URL("/", req.url)); // unauthorized
    }
  }

  // 2. Security Headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
