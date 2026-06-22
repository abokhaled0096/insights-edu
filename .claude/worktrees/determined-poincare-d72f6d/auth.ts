import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma"; // Adjust path as needed
import { Role } from "@/lib/generated/prisma/client";

// 1. Validation Schema
const credentialsSchema = z.object({
  email: z.string().email("Invalid email address."),
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
        // Validate inputs
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Fetch user - handle normalization here
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        // Error handling: User not found or signed up via OAuth (no password)
        if (!user || !user.password) return null;

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        // Return user object including role
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role, // Prisma enum matches our Role type
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as Role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

// 3. Optimized Role Guard Helpers
export const isAdmin = (session: any) => session?.user?.role === Role.ADMIN;
export const isTeacher = (session: any) => session?.user?.role === Role.TEACHER;
export const isStudent = (session: any) => session?.user?.role === Role.STUDENT;
export const isAdvisor = (session: any) => session?.user?.role === Role.ADVISOR;