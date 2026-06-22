import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma/client";

const credentialsSchema = z.object({
  email: z.string().trim().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findFirst({
          where: {
            email: {
              equals: email,
              mode: "insensitive",
            },
          },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          requirePasswordChange: user.requirePasswordChange,
        };
      },
    }),
  ],
  callbacks: {
    // Single source of truth for route protection (runs in proxy.ts / network boundary).
    // Executes once per request, before any page renders, so client layouts never race redirects.
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;

      // Routes that must always be reachable without a session or while a
      // password change is pending. Excluding them prevents the redirect loop.
      const isAuthApi = pathname.startsWith("/api/auth");
      const isPublicRoute =
        pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password" ||
        pathname === "/verify" ||
        pathname === "/error";
      const isForcePasswordChange = pathname === "/force-password-change";

      // Never guard the NextAuth API or it cannot establish/destroy sessions.
      if (isAuthApi) return true;

      const loggedIn = !!auth?.user;
      const mustChangePassword = auth?.user?.requirePasswordChange === true;

      // Not logged in: only public auth routes are allowed.
      if (!loggedIn) {
        if (isPublicRoute) return true;
        return false; // NextAuth redirects to the configured signIn page (/login)
      }

      // Logged in but a password change is required:
      // allow ONLY the force-password-change page, push everything else there.
      if (mustChangePassword) {
        if (isForcePasswordChange) return true;
        return Response.redirect(
          new URL("/force-password-change", request.nextUrl)
        );
      }

      // Logged in and password is fine: keep them out of auth-only pages.
      if (isPublicRoute || isForcePasswordChange) {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as Role;
        token.requirePasswordChange = user.requirePasswordChange ?? false;
      }
      // On session update (after password change), refresh from DB
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true, requirePasswordChange: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.requirePasswordChange = dbUser.requirePasswordChange;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.requirePasswordChange = token.requirePasswordChange;
      }
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

// Role Guard Helpers
export const isAdmin = (session: any) => session?.user?.role === Role.ADMIN;
export const isTeacher = (session: any) => session?.user?.role === Role.TEACHER;
export const isTA = (session: any) => session?.user?.role === Role.TA;
export const isTeacherOrTA = (session: any) =>
  session?.user?.role === Role.TEACHER || session?.user?.role === Role.TA;
export const isStudent = (session: any) => session?.user?.role === Role.STUDENT;
export const isAdvisor = (session: any) => session?.user?.role === Role.ADVISOR;