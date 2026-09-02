import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/app/database/drizzle";
import { users, institutions } from "@/app/database/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret:
    process.env.AUTH_SECRET ||
    process.env.BETTER_AUTH_SECRET ||
    "2f0d7a2c05d4aec9b1b6d9e214569575d59cce25c5b3b056ae234617c7cbd165",
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toString();
        const password = credentials.password.toString();

        // Check users table first
        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (userResult.length > 0) {
          const isPasswordValid = await compare(password, userResult[0].password);
          if (!isPasswordValid) return null;

          return {
            id: userResult[0].id,
            email: userResult[0].email,
            name: userResult[0].fullName,
            role: userResult[0].role as "USER" | "ADMIN",
          } as User;
        }

        // Check institutions table
        const institutionResult = await db
          .select()
          .from(institutions)
          .where(eq(institutions.email, email))
          .limit(1);

        if (institutionResult.length > 0) {
          // Only APPROVED institutions can log in
          if (institutionResult[0].status !== "APPROVED") return null;

          const isPasswordValid = await compare(
            password,
            institutionResult[0].password
          );
          if (!isPasswordValid) return null;

          return {
            id: institutionResult[0].id,
            email: institutionResult[0].email,
            name: institutionResult[0].institutionName,
            role: "INSTITUTION",
          } as User;
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.role = token.role as "USER" | "INSTITUTION" | "ADMIN";
      }
      return session;
    },
  },
});