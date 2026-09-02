// Admin navigation links (sidebar)
export const adminNavbarLinks = [
  {
    img: "/icons/admin/home.svg",
    route: "/admin",
    text: "Home",
  },
  {
    img: "/icons/admin/verify.svg",
    route: "/admin/institutions",
    text: "Verify Institution",
  },
];

// User (donor) top navbar links
export const userNavLinks = [
  { label: "Home", href: "/" },
  { label: "Find a Donation", href: "/donate" },
  { label: "History", href: "/history" },
];

// Institution sidebar links
export const institutionNavLinks = [
  { label: "Dashboard", href: "/institution" },
  { label: "Manage Donations", href: "/institution/donations" },
  { label: "History", href: "/institution/history" },
];

// Donation categories
export const DONATION_CATEGORIES = [
  { value: "shirt", label: "Shirt / Clothing" },
  { value: "school_supplies", label: "School Supplies" },
  { value: "toys", label: "Toys" },
  { value: "electronics", label: "Electronics" },
  { value: "home_supplies", label: "Home Supplies" },
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  shirt: "Shirt / Clothing",
  school_supplies: "School Supplies",
  toys: "Toys",
  electronics: "Electronics",
  home_supplies: "Home Supplies",
};

// Aliases for backwards compatibility with any old imports
export const categoryLabels = CATEGORY_LABELS;
export const adminNavLinks = adminNavbarLinks;

// Delivery method labels
export const DELIVERY_METHOD_LABELS: Record<string, string> = {
  self_delivery: "Self Delivery",
  third_party_courier: "Third Party Courier",
  pickup_by_institution: "Pickup by Institution",
};

// Distance filter options for find donation page
export const DISTANCE_FILTERS = [
  { value: 0.5, label: "0.5 km" },
  { value: 1, label: "1 km" },
  { value: 2, label: "2 km" },
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 25, label: "25 km" },
];
