// ─── Donation ─────────────────────────────────────────────
interface Donation {
  id: string;
  title: string;
  institutionName: string;
  institutionLogo: string;
  coverImage: string;
  location: string;
  distance: string;
  currentAmount: number;
  targetAmount: number;
  createdAt: Date|null;
}

// ─── Auth Credentials ─────────────────────────────────────
// These match the server action parameter shapes in lib/actions/auth.ts

interface UserSignUpCredentials {
  name: string;
  birthdate: string;
  phonenumber: string;
  email: string;
  city: string;
  state: string;
  zipCode: string;
  address: string;
  password: string;
}

interface InstitutionSignUpCredentials {
  institutionName: string;
  email: string;
  phoneNumber: string;
  city: string;
  state: string;
  zipCode: string;
  address: string;
  verificationEvidence: string;
  hasPickupService: string;
  websiteOrSocial?: string;
  description: string;
  password: string;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface DonationParams{
  title: string;
  category: string;
  donationRequired: number;
  deliveryMethods: string;
  description: string;
  donationCover: string;
}