import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/app/database/drizzle";
import { users, donatur, institutions, sessions, account, verification } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account,
      verification,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    useAdditionalFieldsInCookie: true,
    disableCSRFCheck: true,
    generateId: () => {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      throw new Error("crypto.randomUUID is not available in this environment");
    },
  },
});

// Helper function to safely get session with error handling
export async function getSession(headers: Headers) {
  try {
    const session = await auth.api.getSession({ headers });
    return session;
  } catch (error) {
    // Session query failed - likely invalid or expired token
    // Return null to treat as unauthenticated
    return null;
  }
}

// Helper functions for custom auth logic
export async function signInWithCredentials(email: string, password: string, reqHeaders?: Headers) {
  try {
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      ...(reqHeaders ? { headers: reqHeaders } : {}),
    });

    console.log("SignIn result:", { success: true, user: result.user?.id });

    if (!result.user) {
      return { success: false, error: "Invalid credentials" };
    }

    // Determine role for redirect
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length > 0) {
      return { success: true, role: user[0].role };
    }

    // Check institutions
    const institution = await db
      .select()
      .from(institutions)
      .where(eq(institutions.email, email))
      .limit(1);

    if (institution.length > 0) {
      if (institution[0].status !== "APPROVED") {
        return { success: false, error: "Institution account not approved" };
      }
      return { success: true, role: "INSTITUTION" };
    }

    return { success: true, role: "USER" };
  } catch (error) {
    console.error("Signin error:", error);
    return { success: false, error: "Invalid email or password." };
  }
}

export async function signUpUser(data: {
  name: string;
  email: string;
  password: string;
  birthdate?: string;
  phoneNumber?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  address?: string;
}) {
  try {
    const hashedPassword = await hashPassword(data.password);
    const userId = crypto.randomUUID();

    // Insert base user record
    await db.insert(users).values({
      id: userId,
      email: data.email,
      password: hashedPassword,
      name: data.name,
      fullName: data.name,
      role: "USER",
      status: "APPROVED",
    });

    // Insert donatur child record with USER-specific profile data
    await db.insert(donatur).values({
      userId: userId,
      birthdate: data.birthdate,
      phoneNumber: data.phoneNumber,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      address: data.address,
    });

    // Insert account record for Better Auth credential login
    await db.insert(account).values({
      id: crypto.randomUUID(),
      userId: userId,
      accountId: userId,
      providerId: "credential",
      password: hashedPassword,
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "An error occurred during sign up." };
  }
}

export async function signUpInstitution(data: {
  institutionName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  address?: string;
  verificationEvidence?: string;
  websiteOrSocial?: string;
  description?: string;
}) {
  try {
    // Create institution record with better-auth password hashing
    const hashedPassword = await hashPassword(data.password);
    const instId = crypto.randomUUID();

    // Insert base user record
    await db.insert(users).values({
      id: instId,
      email: data.email,
      password: hashedPassword,
      name: data.institutionName,
      fullName: data.institutionName,
      role: "INSTITUTION",
      status: "PENDING",
    });

    // Insert account record for Better Auth credential login
    await db.insert(account).values({
      id: crypto.randomUUID(),
      userId: instId,
      accountId: instId,
      providerId: "credential",
      password: hashedPassword,
    });

    // Insert institution child record
    await db.insert(institutions).values({
      id: instId,
      userId: instId,
      institutionName: data.institutionName,
      email: data.email,
      password: hashedPassword,
      phoneNumber: data.phoneNumber,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      address: data.address,
      verificationEvidence: data.verificationEvidence,
      websiteOrSocial: data.websiteOrSocial,
      description: data.description,
      status: "PENDING",
    });

    return { success: true };
  } catch (error) {
    console.error("Institution signup error:", error);
    return { success: false, error: "An error occurred during registration." };
  }
}