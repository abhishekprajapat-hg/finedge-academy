export const financialDisclaimer =
  "Educational purposes only. This platform provides financial education and illustrative tools, not personalized investment advice. Please consult a SEBI-registered investment advisor and/or licensed insurance professional before acting.";

export const leadSources = {
  HOME_HERO: "Home Hero CTA",
  CONTACT_PAGE: "Contact Page",
  BLOG_CTA: "Blog CTA",
  CONSULTATION: "Consultation Request",
  TERM_CALCULATOR: "Term Insurance Calculator",
  BROKERAGE: "Brokerage Hub",
  PROFILE_ENGINE: "Financial Profiling Engine",
} as const;

export type LeadSource = (typeof leadSources)[keyof typeof leadSources];

export const affiliatePartners = [
  {
    key: "zerodha",
    name: "Zerodha",
    category: "Brokerage",
    description: "Low-cost equity and mutual-fund investing platform.",
    destinationUrl: "https://zerodha.com/open-account/",
  },
  {
    key: "groww-mf",
    name: "Groww Mutual Funds",
    category: "Mutual Funds",
    description: "Direct mutual-fund investing with goal-based SIP setup.",
    destinationUrl: "https://groww.in/mutual-funds",
  },
  {
    key: "policybazaar-term",
    name: "Policybazaar Term Insurance",
    category: "Insurance",
    description: "Term insurance comparison and purchase support.",
    destinationUrl: "https://www.policybazaar.com/life-insurance/term-insurance/",
  },
] as const;

