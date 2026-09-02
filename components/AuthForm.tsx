"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, User, Building2, Check, ArrowRight, ShieldCheck } from "lucide-react";
import {
  signInSchema,
  signUpUserSchema,
  signUpInstitutionSchema,
  SignInInput,
  SignUpUserInput,
  SignUpInstitutionInput,
} from "@/lib/validations";
import { signInWithCredentials, signUpUser, signUpInstitution } from "@/lib/actions/auth";
import VerificationUpload from "./VerificationUpload";

interface AuthFormProps {
  type: "SIGN_IN" | "SIGN_UP";
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const isSignIn = type === "SIGN_IN";
  const router = useRouter();
  const [role, setRole] = useState<"user" | "institution">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const signInForm = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const userSignUpForm = useForm<SignUpUserInput>({
    resolver: zodResolver(signUpUserSchema),
    defaultValues: {
      name: "", birthdate: "", phonenumber: "", email: "",
      city: "", state: "", zipCode: "", address: "",
      password: "", confirmPassword: "",
    },
  });

  const institutionSignUpForm = useForm<SignUpInstitutionInput>({
    resolver: zodResolver(signUpInstitutionSchema),
    defaultValues: {
      institutionName: "", email: "", phoneNumber: "", city: "",
      state: "", zipCode: "", address: "", verificationEvidence: "",
      websiteOrSocial: "", description: "", password: "", confirmPassword: "",
    },
  });

  const handleSignInSubmit = async (data: SignInInput) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const result = await signInWithCredentials(data);
      if (result?.success) {
        // Redirect handled by next-auth callbackUrl or default
        router.push("/");
        router.refresh();
      } else {
        setFormError(result?.error || "Invalid email or password.");
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleUserSignUpSubmit = async (data: SignUpUserInput) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const { confirmPassword: _cp, ...submitData } = data;
      const result = await signUpUser(submitData);
      if (result?.success) {
        setIsSubmitted(true);
      } else {
        setFormError(result?.error || "An error occurred.");
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleInstitutionSignUpSubmit = async (data: SignUpInstitutionInput) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const { confirmPassword: _cp, ...submitData } = data;
      const result = await signUpInstitution(submitData);
      if (result?.success) {
        setIsSubmitted(true);
      } else {
        setFormError(result?.error || "An error occurred.");
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    }
    setIsSubmitting(false);
  };

  // Success screen after registration
  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "var(--color-primary-100)", color: "var(--color-primary)" }}
        >
          <Check className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-poppins)" }}>
          {role === "institution" ? "Application Submitted!" : "Account Created!"}
        </h2>
        <p className="text-sm max-w-md mb-6" style={{ color: "var(--color-on-surface-variant)" }}>
          {role === "institution"
            ? "Your institution application has been submitted. Our admin team will review it shortly. You will be notified via email."
            : "Your account has been created. Welcome to the Cheerity community!"}
        </p>
        <Link
          href={role === "institution" ? "/sign-in" : "/"}
          className="btn-primary"
          style={{ width: "auto", padding: "12px 28px", borderRadius: "9999px", gap: "8px" }}
        >
          <span>{role === "institution" ? "Go to Sign In" : "Go to Homepage"}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="auth-logo">
        <Image src="/assets/logo.png" alt="Cheerity" width={160} height={40} priority />
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-poppins)", color: "var(--color-on-surface)" }}>
          {isSignIn ? "Welcome Back!" : "Create an Account"}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
          {isSignIn
            ? "Sign in to manage your donations and explore campaigns."
            : "Join Cheerity as an individual donor or a registered institution."}
        </p>
      </div>

      {/* Role Toggle - Sign Up only */}
      {!isSignIn && (
        <div className="role-toggle">
          <button type="button" onClick={() => setRole("user")} className={`role-toggle-btn ${role === "user" ? "active" : ""}`}>
            <User className="h-4 w-4" />
            <span>User (Donor)</span>
          </button>
          <button type="button" onClick={() => setRole("institution")} className={`role-toggle-btn ${role === "institution" ? "active" : ""}`}>
            <Building2 className="h-4 w-4" />
            <span>Institution / NGO</span>
          </button>
        </div>
      )}

      {/* Global form error */}
      {formError && (
        <div className="form-error-box">
          <p>{formError}</p>
        </div>
      )}

      {/* Sign In Form */}
      {isSignIn && (
        <form onSubmit={signInForm.handleSubmit(handleSignInSubmit)} className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" placeholder="name@example.com" {...signInForm.register("email")} className="form-input" />
            {signInForm.formState.errors.email && <p className="form-error">{signInForm.formState.errors.email.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...signInForm.register("password")}
                className="form-input"
                style={{ paddingRight: "44px" }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="pw-toggle-btn">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {signInForm.formState.errors.password && <p className="form-error">{signInForm.formState.errors.password.message}</p>}
          </div>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>
      )}

      {/* Sign Up - User / Donor */}
      {!isSignIn && role === "user" && (
        <form onSubmit={userSignUpForm.handleSubmit(handleUserSignUpSubmit)} className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" placeholder="Enter your name" {...userSignUpForm.register("name")} className="form-input" />
            {userSignUpForm.formState.errors.name && <p className="form-error">{userSignUpForm.formState.errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input type="date" {...userSignUpForm.register("birthdate")} className="form-input" />
              {userSignUpForm.formState.errors.birthdate && <p className="form-error">{userSignUpForm.formState.errors.birthdate.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" placeholder="e.g. 081234567890" {...userSignUpForm.register("phonenumber")} className="form-input" />
              {userSignUpForm.formState.errors.phonenumber && <p className="form-error">{userSignUpForm.formState.errors.phonenumber.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" placeholder="name@example.com" {...userSignUpForm.register("email")} className="form-input" />
            {userSignUpForm.formState.errors.email && <p className="form-error">{userSignUpForm.formState.errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="form-group">
              <label className="form-label">City</label>
              <input type="text" placeholder="City" {...userSignUpForm.register("city")} className="form-input" />
              {userSignUpForm.formState.errors.city && <p className="form-error">{userSignUpForm.formState.errors.city.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">State / Province</label>
              <input type="text" placeholder="State" {...userSignUpForm.register("state")} className="form-input" />
              {userSignUpForm.formState.errors.state && <p className="form-error">{userSignUpForm.formState.errors.state.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Zip Code</label>
              <input type="text" placeholder="Zip" {...userSignUpForm.register("zipCode")} className="form-input" />
              {userSignUpForm.formState.errors.zipCode && <p className="form-error">{userSignUpForm.formState.errors.zipCode.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Address</label>
            <input type="text" placeholder="Street, number, area" {...userSignUpForm.register("address")} className="form-input" />
            {userSignUpForm.formState.errors.address && <p className="form-error">{userSignUpForm.formState.errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Min 6 characters" {...userSignUpForm.register("password")} className="form-input" style={{ paddingRight: "44px" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="pw-toggle-btn">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {userSignUpForm.formState.errors.password && <p className="form-error">{userSignUpForm.formState.errors.password.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter password" {...userSignUpForm.register("confirmPassword")} className="form-input" style={{ paddingRight: "44px" }} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="pw-toggle-btn">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {userSignUpForm.formState.errors.confirmPassword && <p className="form-error">{userSignUpForm.formState.errors.confirmPassword.message}</p>}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>
      )}

      {/* Sign Up - Institution */}
      {!isSignIn && role === "institution" && (
        <form onSubmit={institutionSignUpForm.handleSubmit(handleInstitutionSignUpSubmit)} className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Institution Name</label>
            <input type="text" placeholder="Enter institution name" {...institutionSignUpForm.register("institutionName")} className="form-input" />
            {institutionSignUpForm.formState.errors.institutionName && <p className="form-error">{institutionSignUpForm.formState.errors.institutionName.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Institution Email</label>
              <input type="email" placeholder="official@institution.com" {...institutionSignUpForm.register("email")} className="form-input" />
              {institutionSignUpForm.formState.errors.email && <p className="form-error">{institutionSignUpForm.formState.errors.email.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" placeholder="e.g. 021-12345678" {...institutionSignUpForm.register("phoneNumber")} className="form-input" />
              {institutionSignUpForm.formState.errors.phoneNumber && <p className="form-error">{institutionSignUpForm.formState.errors.phoneNumber.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="form-group">
              <label className="form-label">City</label>
              <input type="text" placeholder="City" {...institutionSignUpForm.register("city")} className="form-input" />
              {institutionSignUpForm.formState.errors.city && <p className="form-error">{institutionSignUpForm.formState.errors.city.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">State / Province</label>
              <input type="text" placeholder="State" {...institutionSignUpForm.register("state")} className="form-input" />
              {institutionSignUpForm.formState.errors.state && <p className="form-error">{institutionSignUpForm.formState.errors.state.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Zip Code</label>
              <input type="text" placeholder="Zip" {...institutionSignUpForm.register("zipCode")} className="form-input" />
              {institutionSignUpForm.formState.errors.zipCode && <p className="form-error">{institutionSignUpForm.formState.errors.zipCode.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Institution Address</label>
            <input type="text" placeholder="Full address" {...institutionSignUpForm.register("address")} className="form-input" />
            {institutionSignUpForm.formState.errors.address && <p className="form-error">{institutionSignUpForm.formState.errors.address.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label flex items-center justify-between">
              <span>Verification Evidence</span>
              <span className="text-xs font-normal flex items-center gap-1" style={{ color: "var(--color-primary-700)" }}>
                <ShieldCheck className="h-3.5 w-3.5" /> Required for Admin Review
              </span>
            </label>
            <VerificationUpload
              value={institutionSignUpForm.watch("verificationEvidence")}
              onChange={(val) => institutionSignUpForm.setValue("verificationEvidence", val)}
              error={institutionSignUpForm.formState.errors.verificationEvidence?.message}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Official Website{" "}
              <span style={{ color: "var(--color-on-surface-variant)", fontWeight: 400 }}>(Optional)</span>
            </label>
            <input type="text" placeholder="https://your-institution.org" {...institutionSignUpForm.register("websiteOrSocial")} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Short Description</label>
            <textarea
              rows={3}
              placeholder="Describe your institution's mission and programs..."
              {...institutionSignUpForm.register("description")}
              className="form-input form-textarea"
            />
            {institutionSignUpForm.formState.errors.description && <p className="form-error">{institutionSignUpForm.formState.errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Min 6 characters" {...institutionSignUpForm.register("password")} className="form-input" style={{ paddingRight: "44px" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="pw-toggle-btn">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {institutionSignUpForm.formState.errors.password && <p className="form-error">{institutionSignUpForm.formState.errors.password.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter password" {...institutionSignUpForm.register("confirmPassword")} className="form-input" style={{ paddingRight: "44px" }} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="pw-toggle-btn">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {institutionSignUpForm.formState.errors.confirmPassword && <p className="form-error">{institutionSignUpForm.formState.errors.confirmPassword.message}</p>}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Institution Application"}
          </button>
        </form>
      )}

      <div className="text-center pt-2 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
        {isSignIn ? (
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-bold" style={{ color: "var(--color-primary)" }}>Sign Up</Link>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <Link href="/sign-in" className="font-bold" style={{ color: "var(--color-primary)" }}>Sign In</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;