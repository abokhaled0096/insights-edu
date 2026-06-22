import { Role } from "@/lib/generated/prisma/client";
import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: Role;
    requirePasswordChange?: boolean;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
      requirePasswordChange: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    requirePasswordChange: boolean;
  }
}