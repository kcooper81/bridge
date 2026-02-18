import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection({
  headline,
  gradientText,
  subtitle,
  buttonText = "Create your workspace",
  buttonHref = "/signup",
}: {
  headline: string;
  gradientText: string;
  subtitle: string;
  buttonText?: string;
  buttonHref?: string;
}) {
  return (
    <div className="text-center">
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
        {headline}
        <br />
        <span className="text-primary">{gradientText}</span>
      </h2>
      <p className="mt-6 text-lg text-muted-foreground max-w-lg mx-auto">
        {subtitle}
      </p>
      <Link href={buttonHref} className="mt-8 inline-block">
        <Button
          size="lg"
          className="text-base px-8 h-12 rounded-full font-semibold"
        >
          {buttonText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
