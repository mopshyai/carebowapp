import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          type: user.type,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.type = (user as { type?: string }).type;
        
        // PERFORMANCE: Cache hasProfile in JWT on sign-in to avoid DB query on every request
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            familyProfile: { select: { id: true } },
            caregiverProfile: { select: { id: true } },
          },
        });
        token.hasProfile = !!(dbUser?.familyProfile || dbUser?.caregiverProfile);
      }
      
      // Allow manual refresh of profile status via update trigger
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            familyProfile: { select: { id: true } },
            caregiverProfile: { select: { id: true } },
          },
        });
        token.hasProfile = !!(dbUser?.familyProfile || dbUser?.caregiverProfile);
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { type?: string }).type = token.type as string;
        // PERFORMANCE: Use cached value from JWT instead of DB query
        (session.user as { hasProfile?: boolean }).hasProfile = token.hasProfile as boolean;
      }
      return session;
    },
  },
});

// Type extensions for NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      type?: string;
      hasProfile?: boolean;
    };
  }

  interface User {
    type?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    type?: string;
    hasProfile?: boolean;
  }
}
