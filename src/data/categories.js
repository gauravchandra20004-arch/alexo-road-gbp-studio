export const GBP_CATEGORIES = [
  "Restaurant",
  "Cafe",
  "Grocery store",
  "Supermarket",
  "Clothing store",
  "Car repair and maintenance",
  "Auto parts store",
  "Electrician",
  "Plumber",
  "Real estate agency",
  "Doctor",
  "Dental clinic",
  "Pharmacy",
  "Gym",
  "Beauty salon",
  "Hair salon",
  "Electronics store",
  "Hardware store",
  "Travel agency",
  "Hotel",
  "Coaching center",
  "School",
  "Law firm",
  "Accounting service",
  "Photographer",
  "Digital marketing agency",
  "Software company",
  "Manufacturing company",
  "Bakery",
  "Jewelry store",
  "Mobile phone repair shop",
  "Interior designer",
  "Home goods store",
  "Veterinary care"
];

export const INITIAL_FORM_DATA = {
  // Step 1: Business Info
  businessName: "",
  primaryCategory: "Car repair and maintenance",
  secondaryCategory: "",
  contactNumber: "",
  email: "",
  website: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  openingTime: "09:00",
  closingTime: "20:00",
  openDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  services: ["Free Consultation", "On-site Service", "Online Appointment"],

  // Step 2: Map & Road Location
  latitude: 28.6139,
  longitude: 77.2090,
  roadEntranceLat: 28.6142,
  roadEntranceLng: 77.2092,
  landmark: "",
  roadName: "Main Road",

  // Step 3: Photos (storefront, road picture, signboard, interior)
  photos: {
    roadView: null,
    storefront: null,
    signboard: null,
    interior: null
  },

  // Step 4: SEO Description
  seoDescription: "",
  keywords: ["best local service", "near me", "verified store", "emergency service"],

  // Step 5: Checklist
  checklistCompleted: {}
};
