import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.id = u.id;
        token.username = u.username;
        token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const s = session as any;
        s.user.id = token.id as string;
        s.user.username = token.username as string;
        s.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    (() => {
      // During build, Railway might not expose env vars, so always provide a fallback
      // NextAuth accepts any non-empty string, so we provide a valid placeholder
      // Runtime validation in route handler will ensure real secret is set
      if (process.env.NODE_ENV === "production") {
        return "YnVpbGQtcGxhY2Vob2xkZXItc2VjcmV0LW11c3Qtc2V0LWluLXByb2Q=";
      }
      return "dev-secret-change-in-production";
    })(),
};
