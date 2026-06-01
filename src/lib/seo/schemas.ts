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
    // Enables the Google sitelinks searchbox in SERP results. Requires the
    // "?q=" route to actually return a search results page; we ship one
    // (Next.js redirect at /search → /blog?q= for now).
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
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

/**
 * TechArticle with named Person author + dateModified.
 *
 * Two E-E-A-T levers Google rewards heavily in 2026:
 *   1. Named human author (Person, not Organization) with sameAs to an
 *      external profile — Authoritas 2026 found 1.8x AI Overview citation
 *      rate for pages with Person schema vs Organization-attributed.
 *   2. Visible dateModified within the last 60 days — Authoritas 2026 also
 *      found 28% more AI citations on recently-updated pages.
 *
 * Use this on /solutions/[slug], /compare/[slug], /compliance/[framework],
 * /industries/[slug] — anywhere with substantive editorial content. Blog
 * articles already have their own Article schema in blog/[slug]/page.tsx.
 */
export function generateTechArticleSchema(opts: {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
}) {
  const today = new Date().toISOString().split("T")[0];
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: opts.headline,
    description: opts.description,
    url: opts.url,
    datePublished: opts.datePublished || "2026-04-01",
    dateModified: opts.dateModified || today,
    ...(opts.image && { image: opts.image }),
    author: {
      "@type": "Person",
      name: "Eric Campton",
      jobTitle: "Founder, TeamPrompt",
      url: `${SITE_URL}/about/team/eric-campton`,
      sameAs: [
        "https://www.linkedin.com/company/teamprompt",
      ],
      worksFor: {
        "@type": "Organization",
        name: "TeamPrompt",
        url: SITE_URL,
      },
    },
    publisher: {
      "@type": "Organization",
      name: "TeamPrompt",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand/logo-icon-blue.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": opts.url,
    },
  };
}
