import { DarkSection } from "./dark-section";
import { SectionLabel } from "./section-label";
import { generateFAQSchema } from "@/lib/seo/schemas";

export function FAQSection({
  faqs,
  includeSchema = true,
}: {
  faqs: { question: string; answer: string }[];
  includeSchema?: boolean;
}) {
  return (
    <DarkSection gradient="left">
      {includeSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateFAQSchema(faqs)),
          }}
        />
      )}
      <div className="max-w-3xl mx-auto">
        <SectionLabel dark className="text-center">
          FAQ
        </SectionLabel>
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
          Frequently asked questions
        </h2>
        <div className="space-y-0 divide-y divide-white/10">
          {faqs.map((faq) => (
            <div key={faq.question} className="py-6 first:pt-0 last:pb-0">
              <h3 className="font-semibold text-zinc-100">{faq.question}</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </DarkSection>
  );
}
