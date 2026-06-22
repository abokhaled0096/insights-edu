export { auth as proxy } from "@/auth";

// Run the auth guard on every route except Next.js internals, the NextAuth API,
// and static metadata files. This keeps redirect logic at the network boundary
// (Next.js 16 renamed `middleware` to `proxy`) and avoids running on assets.
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js)$).*)",
  ],
};