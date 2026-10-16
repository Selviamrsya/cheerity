"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Building2, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formErrorBoxClass, formControlClass } from "@/lib/ui";
import { AppButton } from "@/components/ui/app-button";
import {
  FormLabel,
} from "@/components/ui/form-field";
import { PasswordToggle } from "@/components/ui/password-toggle";
import {
  signInSchema,
  signUpUserSchema,
  signUpInstitutionSchema,
  SignInInput,
  SignUpUserInput,
  SignUpInstitutionInput,
} from "@/lib/validations";
import { signUpUser, signUpInstitution, getUserRole } from "@/lib/actions/auth";
import { authClient } from "@/lib/auth-client";
import VerificationUpload from "./VerificationUpload";
import LocationFields from "./LocationFields";
import AddressSearch from "./AddressSearch";
import MapPicker from "./MapPicker";
import { ReverseGeocodeResult } from "@/lib/reverseGeocoding";

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
  const [userAddressValid, setUserAddressValid] = useState(false);
  const [institutionAddressValid, setInstitutionAddressValid] = useState(false);

  const cardClass = cn(
    "relative z-1 w-full rounded-sm border border-gray-200 bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.03),0_10px_25px_-5px_rgba(0,0,0,0.04)]",
    isSignIn
      ? "max-w-[450px] md:max-w-[480px] p-6 sm:p-8"
      : "my-3 max-w-[450px] md:max-w-[750px] p-6 sm:my-6 sm:p-12"
  );

  const signInForm = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const userSignUpForm = useForm<SignUpUserInput>({
    resolver: zodResolver(signUpUserSchema),
    defaultValues: {
      name: "", birthdate: "", phonenumber: "", email: "",
      city: "", state: "", zipCode: "", address: "",
      latitude: undefined,
      longitude: undefined,
      password: "", confirmPassword: "",
    },
  });

  const institutionSignUpForm = useForm<SignUpInstitutionInput>({
    resolver: zodResolver(signUpInstitutionSchema),
    defaultValues: {
      institutionName: "", email: "", phoneNumber: "", city: "",
      state: "", zipCode: "", address: "", verificationEvidence: "",
      latitude: undefined,
      longitude: undefined,
      websiteOrSocial: "", description: "", password: "", confirmPassword: "",
    },
  });

  const handleSignInSubmit = async (data: SignInInput) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setFormError(error.message || "Invalid email or password.");
        setIsSubmitting(false);
        return;
      }

      // Check role and redirect
      const roleData = await getUserRole(data.email);

      if (roleData.role === "ADMIN") {
        router.push("/admin");
      } else if (roleData.role === "INSTITUTION") {
        if (roleData.status !== "APPROVED") {
          setFormError("Institution account not approved yet.");
          await authClient.signOut(); // Clean up if not approved
          setIsSubmitting(false);
          return;
        }
        router.push("/institution");
      } else {
        router.push("/");
      }

      router.refresh();
    } catch (e: unknown) {
      console.error(e);
      setFormError("Something went wrong. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleUserSignUpSubmit = async (data: SignUpUserInput) => {
    setIsSubmitting(true);
    setFormError(null);

    // Validate that a valid address is selected (less strict - allow if city/state are filled)
    if (!userAddressValid && (!data.city || !data.state)) {
      setFormError("Please search and select a valid address from the suggestions, or provide city and state.");
      setIsSubmitting(false);
      return;
    }

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

    // Validate that a valid address is selected (less strict - allow if city/state are filled)
    if (!institutionAddressValid && (!data.city || !data.state)) {
      setFormError("Please search and select a valid address from the suggestions, or provide city and state.");
      setIsSubmitting(false);
      return;
    }

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

  const handleUserAddressSelect = (data: {
    fullAddress: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  }) => {
    userSignUpForm.setValue("address", data.fullAddress, { shouldValidate: true });
    userSignUpForm.setValue("city", data.city, { shouldValidate: true });
    userSignUpForm.setValue("state", data.state, { shouldValidate: true });
    userSignUpForm.setValue("zipCode", data.zipCode, { shouldValidate: true });
    userSignUpForm.setValue("latitude", data.latitude, { shouldValidate: true });
    userSignUpForm.setValue("longitude", data.longitude, { shouldValidate: true });
    setUserAddressValid(true);
  };

  const handleInstitutionAddressSelect = (data: {
    fullAddress: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  }) => {
    institutionSignUpForm.setValue("address", data.fullAddress, { shouldValidate: true });
    institutionSignUpForm.setValue("city", data.city, { shouldValidate: true });
    institutionSignUpForm.setValue("state", data.state, { shouldValidate: true });
    institutionSignUpForm.setValue("zipCode", data.zipCode, { shouldValidate: true });
    institutionSignUpForm.setValue("latitude", data.latitude, { shouldValidate: true });
    institutionSignUpForm.setValue("longitude", data.longitude, { shouldValidate: true });
    setInstitutionAddressValid(true);
  };

  const handleUserMapAddressChange = (addressData: ReverseGeocodeResult) => {
    if (addressData.success) {
      userSignUpForm.setValue("state", addressData.state, { shouldValidate: true });
      userSignUpForm.setValue("city", addressData.city, { shouldValidate: true });
      userSignUpForm.setValue("zipCode", addressData.zipCode, { shouldValidate: true });
    }
  };

  const handleInstitutionMapAddressChange = (addressData: ReverseGeocodeResult) => {
    if (addressData.success) {
      institutionSignUpForm.setValue("state", addressData.state, { shouldValidate: true });
      institutionSignUpForm.setValue("city", addressData.city, { shouldValidate: true });
      institutionSignUpForm.setValue("zipCode", addressData.zipCode, { shouldValidate: true });
    }
  };

  // Success screen after registration
  if (isSubmitted) {
    return (
      <div className={cardClass}>
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary">
            <Check className="h-8 w-8" />
          </div>
          <h2 className="font-poppins mb-2 text-2xl font-bold">
            {role === "institution" ? "Application Submitted!" : "Account Created!"}
          </h2>
          <p className="mb-2 max-w-md text-sm text-on-surface-variant">
            {role === "institution"
              ? "Your institution application has been submitted. Our admin team will review it shortly. You will be notified via email."
              : "Your account has been created. Welcome to the Cheerity community!"}
          </p>
          <Link
            href={role === "institution" ? "/sign-in" : "/"}
            className="mt-4 inline-flex w-auto items-center gap-2 rounded-sm bg-primary px-16 py-3 font-semibold text-white hover:bg-primary-dark"
          >
            <span>{role === "institution" ? "Go to Sign In" : "Go to Homepage"}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <div className="flex flex-col gap-3">
        <div className="mb-1 flex justify-center">
          <Image src="/assets/logo.png" alt="Cheerity" width={110} height={28} priority />
        </div>

        <div className="mb-5 text-center">
          <h1 className="font-poppins text-2xl font-bold tracking-tight text-on-surface">
            {isSignIn ? "Welcome Back!" : "Create an Account"}
          </h1>
        </div>

        {!isSignIn && (
          <div className="mb-2 flex gap-2 rounded-sm bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-sm border-none px-3 py-2 text-[13px] font-medium transition-all",
                role === "user"
                  ? "bg-white font-semibold text-primary-800 shadow-sm"
                  : "bg-transparent text-gray-600 hover:text-gray-900"
              )}
            >
              <User className="h-4 w-4" />
              <span>User</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("institution")}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-sm border-none px-3 py-2 text-[13px] font-medium transition-all",
                role === "institution"
                  ? "bg-white font-semibold text-primary-800 shadow-sm"
                  : "bg-transparent text-gray-600 hover:text-gray-900"
              )}
            >
              <Building2 className="h-4 w-4" />
              <span>Institution / NGO</span>
            </button>
          </div>
        )}

        {formError && (
          <div className={formErrorBoxClass}>
            <p>{formError}</p>
          </div>
        )}

        {/* Sign In Form */}
        {isSignIn && (
          <form onSubmit={signInForm.handleSubmit(handleSignInSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <FormLabel>Email</FormLabel>
              <input type="email" placeholder="Enter your email address" {...signInForm.register("email")} className={formControlClass} />
              {signInForm.formState.errors.email && <p className="mt-0.5 text-xs text-red-600">{signInForm.formState.errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...signInForm.register("password")}
                  className={formControlClass}
                  style={{ paddingRight: "44px" }}
                />
                <PasswordToggle visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
              </div>
              {signInForm.formState.errors.password && <p className="mt-0.5 text-xs text-red-600">{signInForm.formState.errors.password.message}</p>}
            </div>
            <AppButton type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? "Signing in..." : "Login"}
            </AppButton>
          </form>
        )}

        {/* Sign Up - User / Donor */}
        {!isSignIn && role === "user" && (
          <form onSubmit={userSignUpForm.handleSubmit(handleUserSignUpSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <FormLabel>Name</FormLabel>
              <input type="text" placeholder="Enter your full name" {...userSignUpForm.register("name")} className={formControlClass} />
              {userSignUpForm.formState.errors.name && <p className="mt-0.5 text-xs text-red-600">{userSignUpForm.formState.errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
              <input type="date" {...userSignUpForm.register("birthdate")} className={formControlClass} required />
              {userSignUpForm.formState.errors.birthdate && <p className="mt-0.5 text-xs text-red-600">{userSignUpForm.formState.errors.birthdate.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
              <input type="tel" placeholder="e.g. 081234567890" {...userSignUpForm.register("phonenumber")} className={formControlClass} required />
              {userSignUpForm.formState.errors.phonenumber && <p className="mt-0.5 text-xs text-red-600">{userSignUpForm.formState.errors.phonenumber.message}</p>}
            </div>


            <div className="flex flex-col gap-1.5">
              <FormLabel>Email</FormLabel>
              <input type="email" placeholder="Enter your email address" {...userSignUpForm.register("email")} className={formControlClass} />
              {userSignUpForm.formState.errors.email && <p className="mt-0.5 text-xs text-red-600">{userSignUpForm.formState.errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <FormLabel>Search Address <span className="text-red-500">*</span></FormLabel>
              <AddressSearch
                onAddressSelect={handleUserAddressSelect}
                onClear={() => setUserAddressValid(false)}
              />
              <p className="mt-1 text-xs text-on-surface-variant">
                Search and select your address from the suggestions. This is required for location services. You can edit the location fields after selection.
              </p>
            </div>
            <LocationFields
              stateValue={userSignUpForm.watch("state")}
              cityValue={userSignUpForm.watch("city")}
              zipCodeValue={userSignUpForm.watch("zipCode")}
              onStateChange={(val) => userSignUpForm.setValue("state", val, { shouldValidate: true })}
              onCityChange={(val) => userSignUpForm.setValue("city", val, { shouldValidate: true })}
              onZipCodeChange={(val) => userSignUpForm.setValue("zipCode", val, { shouldValidate: true })}
              errors={{
                state: userSignUpForm.formState.errors.state?.message,
                city: userSignUpForm.formState.errors.city?.message,
                zipCode: userSignUpForm.formState.errors.zipCode?.message,
              }}
              readOnly={false}
            />

            {userSignUpForm.watch("latitude") && userSignUpForm.watch("longitude") && (
              <div className="flex flex-col gap-1.5">
                <FormLabel>Fine-tune Location</FormLabel>
                <p className="text-xs text-on-surface-variant">
                  Drag the red marker to adjust the exact location for precise pickup/delivery. Address fields will auto-update based on the pin location.
                </p>
                <MapPicker
                  latitude={userSignUpForm.watch("latitude") || 0}
                  longitude={userSignUpForm.watch("longitude") || 0}
                  onLocationChange={(lat, lng) => {
                    userSignUpForm.setValue("latitude", lat, { shouldValidate: true });
                    userSignUpForm.setValue("longitude", lng, { shouldValidate: true });
                  }}
                  onAddressChange={handleUserMapAddressChange}
                  height="300px"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <FormLabel>Detailed Address (optional)</FormLabel>
              <textarea
                rows={2}
                placeholder="Additional details like landmark, gate color, building name, floor, etc. (e.g., 'Near laundry, green gate, 2nd floor')"
                className={`${formControlClass} min-h-20 resize-none`}
                {...userSignUpForm.register("address")}
              />
              <p className="mt-1 text-xs text-on-surface-variant">
                Add specific details to help couriers or pickup services find your location easily.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Enter your password (min 6 characters)" {...userSignUpForm.register("password")} className={formControlClass} style={{ paddingRight: "44px" }} />
                <PasswordToggle visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
              </div>
              {userSignUpForm.formState.errors.password && <p className="mt-0.5 text-xs text-red-600">{userSignUpForm.formState.errors.password.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <FormLabel>Confirm Password</FormLabel>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} placeholder="Enter your password again" {...userSignUpForm.register("confirmPassword")} className={formControlClass} style={{ paddingRight: "44px" }} />
                <PasswordToggle visible={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
              </div>
              {userSignUpForm.formState.errors.confirmPassword && <p className="mt-0.5 text-xs text-red-600">{userSignUpForm.formState.errors.confirmPassword.message}</p>}
            </div>

            <AppButton type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? "Creating account..." : "Create Account"}
            </AppButton>
          </form>
        )}

        {/* Sign Up - Institution */}
        {!isSignIn && role === "institution" && (
          <form onSubmit={institutionSignUpForm.handleSubmit(handleInstitutionSignUpSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <FormLabel>Institution Name</FormLabel>
              <input type="text" placeholder="Enter institution name" {...institutionSignUpForm.register("institutionName")} className={formControlClass} />
              {institutionSignUpForm.formState.errors.institutionName && <p className="mt-0.5 text-xs text-red-600">{institutionSignUpForm.formState.errors.institutionName.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <FormLabel>Institution Email</FormLabel>
              <input type="email" placeholder="official@institution.com" {...institutionSignUpForm.register("email")} className={formControlClass} />
              {institutionSignUpForm.formState.errors.email && <p className="mt-0.5 text-xs text-red-600">{institutionSignUpForm.formState.errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
              <input type="tel" placeholder="e.g. 021-12345678" {...institutionSignUpForm.register("phoneNumber")} className={formControlClass} required />
              {institutionSignUpForm.formState.errors.phoneNumber && <p className="mt-0.5 text-xs text-red-600">{institutionSignUpForm.formState.errors.phoneNumber.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <FormLabel>Search Address <span className="text-red-500">*</span></FormLabel>
              <AddressSearch
                onAddressSelect={handleInstitutionAddressSelect}
                onClear={() => setInstitutionAddressValid(false)}
              />
              <p className="text-xs text-on-surface-variant">
                Search and select your institution address from the suggestions. This is required for location services.
              </p>
            </div>
            <LocationFields
              stateValue={institutionSignUpForm.watch("state")}
              cityValue={institutionSignUpForm.watch("city")}
              zipCodeValue={institutionSignUpForm.watch("zipCode")}
              onStateChange={(val) => institutionSignUpForm.setValue("state", val, { shouldValidate: true })}
              onCityChange={(val) => institutionSignUpForm.setValue("city", val, { shouldValidate: true })}
              onZipCodeChange={(val) => institutionSignUpForm.setValue("zipCode", val, { shouldValidate: true })}
              errors={{
                state: institutionSignUpForm.formState.errors.state?.message,
                city: institutionSignUpForm.formState.errors.city?.message,
                zipCode: institutionSignUpForm.formState.errors.zipCode?.message,
              }}
              readOnly={false}
            />

            {institutionSignUpForm.watch("latitude") && institutionSignUpForm.watch("longitude") && (
              <div className="flex flex-col gap-1.5">
                <FormLabel>Fine-tune Location</FormLabel>
                <p className="text-xs text-on-surface-variant">
                  Drag the red marker to adjust the exact location for precise pickup/delivery. Address fields will auto-update based on the pin location.
                </p>
                <MapPicker
                  latitude={institutionSignUpForm.watch("latitude") || 0}
                  longitude={institutionSignUpForm.watch("longitude") || 0}
                  onLocationChange={(lat, lng) => {
                    institutionSignUpForm.setValue("latitude", lat, { shouldValidate: true });
                    institutionSignUpForm.setValue("longitude", lng, { shouldValidate: true });
                  }}
                  onAddressChange={handleInstitutionMapAddressChange}
                  height="300px"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <FormLabel>Detailed Address (optional)</FormLabel>
              <textarea
                rows={2}
                placeholder="Additional details like landmark, gate color, building name, floor, etc. (e.g., 'Near laundry, green gate, 2nd floor')"
                className={`${formControlClass} min-h-20 resize-none`}
                {...institutionSignUpForm.register("address")}
              />
              <p className="text-xs text-on-surface-variant">
                Add specific details to help couriers or pickup services find your location easily.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <FormLabel className="flex items-center justify-between">
                <span>Verification Evidence</span>
                <span className="flex items-center gap-1 text-xs font-normal text-primary-700">
                  <ShieldCheck className="h-3.5 w-3.5" /> Required for Admin Review
                </span>
              </FormLabel>
              <VerificationUpload
                value={institutionSignUpForm.watch("verificationEvidence")}
                onChange={(val) => institutionSignUpForm.setValue("verificationEvidence", val)}
                error={institutionSignUpForm.formState.errors.verificationEvidence?.message}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <FormLabel>
                Official Website{" "}
                <span className="font-normal text-on-surface-variant">(Optional)</span>
              </FormLabel>
              <input type="text" placeholder="https://your-institution.org" {...institutionSignUpForm.register("websiteOrSocial")} className={formControlClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <FormLabel>Short Description</FormLabel>
              <textarea
                rows={4}
                placeholder="Describe your institution's mission and programs..."
                {...institutionSignUpForm.register("description")}
                className={`${formControlClass} min-h-20 resize-none`}
              />
              {institutionSignUpForm.formState.errors.description && <p className="mt-0.5 text-xs text-red-600">{institutionSignUpForm.formState.errors.description.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Enter your password (min 6 characters)" {...institutionSignUpForm.register("password")} className={formControlClass} style={{ paddingRight: "44px" }} />
                <PasswordToggle visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
              </div>
              {institutionSignUpForm.formState.errors.password && <p className="mt-0.5 text-xs text-red-600">{institutionSignUpForm.formState.errors.password.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <FormLabel>Confirm Password</FormLabel>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} placeholder="Enter your password again" {...institutionSignUpForm.register("confirmPassword")} className={formControlClass} style={{ paddingRight: "44px" }} />
                <PasswordToggle visible={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
              </div>
              {institutionSignUpForm.formState.errors.confirmPassword && <p className="mt-0.5 text-xs text-red-600">{institutionSignUpForm.formState.errors.confirmPassword.message}</p>}
            </div>

            <AppButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Institution Application"}
            </AppButton>
          </form>
        )}

        <div className="pt-2 text-center text-sm text-on-surface-variant">
          {isSignIn ? (
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="font-bold text-primary">Sign Up</Link>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <Link href="/sign-in" className="font-bold text-primary">Sign In</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;