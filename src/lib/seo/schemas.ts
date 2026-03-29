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
      "AI data loss prevention and prompt management for teams. Two layers of protection: network-level AI tool control via Cloudflare Gateway and content-level DLP scanning via browser extension. 19 compliance packs, shared prompt library, and audit dashboards.",
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
    logo: `${SITE_URL}/brand/logo-icon-blue.svg`,
    description:
      "AI WorkOS platform providing network-level AI tool control and content-level DLP scanning for teams using ChatGPT, Claude, Gemini, Copilot, and Perplexity.",
    email: "support@teamprompt.app",
    sameAs: [
      "https://x.com/teampromptapp",
      "https://www.linkedin.com/company/teamprompt",
      "https://github.com/kcooper81",
      "https://chromewebstore.google.com/detail/teamprompt/hpdekjimndbhdkebpedfgaceohplbpil",
      "https://addons.mozilla.org/en-US/firefox/addon/teamprompt-ai-prompt-manager/",
    ],
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TeamPrompt",
    url: SITE_URL,
    description:
      "AI Prompt Management for Teams — shared libraries, quality guidelines, and security guardrails.",
    publisher: {
      "@type": "Organization",
      name: "TeamPrompt",
      logo: `${SITE_URL}/brand/logo-icon-blue.svg`,
    },
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
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
