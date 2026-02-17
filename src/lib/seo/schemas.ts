const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

export function generateSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "TeamPrompt",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Chrome Extension",
    description:
      "AI Prompt Vault & Context Bridge for teams. Manage, share, and secure your team's AI prompts.",
    url: SITE_URL,
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        name: "Free",
      },
      {
        "@type": "Offer",
        price: "9",
        priceCurrency: "USD",
        name: "Pro",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          billingDuration: "P1M",
          price: "9",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "Offer",
        price: "7",
        priceCurrency: "USD",
        name: "Team",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          billingDuration: "P1M",
          price: "7",
          priceCurrency: "USD",
          referenceQuantity: { "@type": "QuantitativeValue", value: "1" },
          unitText: "user",
        },
      },
      {
        "@type": "Offer",
        price: "12",
        priceCurrency: "USD",
        name: "Business",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          billingDuration: "P1M",
          price: "12",
          priceCurrency: "USD",
          referenceQuantity: { "@type": "QuantitativeValue", value: "1" },
          unitText: "user",
        },
      },
    ],
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TeamPrompt",
    url: SITE_URL,
    description: "AI Prompt Vault & Context Bridge for teams",
  };
}

export function generateFAQSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
