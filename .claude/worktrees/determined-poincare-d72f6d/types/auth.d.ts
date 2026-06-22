import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

// 1. Define the role type to match your Prisma enum
export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `auth`, contains the session data and the user's role.
   */
  interface Session {
    user: {
      role: UserRole;
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object as returned from the logic in 'authorize' 
   * or the database.
   */
  interface User {
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  /** * Returned by the `jwt` callback and used to persist data in the cookie.
   */
  interface JWT {
    role?: UserRole;
  }
}