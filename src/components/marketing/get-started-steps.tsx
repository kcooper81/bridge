import { Globe, Shield, ShieldCheck } from "lucide-react";

export function GetStartedSteps({ dark = false }: { dark?: boolean }) {
  const steps = [
    {
      step: "1",
      title: "Integrate TeamPrompt",
      desc: "Install the browser extension or use the built-in secure AI chat. Works with Chrome, Edge, and Firefox.",
      icon: Globe,
    },
    {
      step: "2",
      title: "Assess your risk",
      desc: "Get immediate visibility into AI interactions across your team. See what data is being shared and where.",
      icon: Shield,
    },
    {
      step: "3",
      title: "Enforce AI policy",
      desc: "Define DLP rules, enable compliance packs, and apply real-time guardrails across all AI usage.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className={dark ? "py-20 sm:py-28 bg-zinc-950 text-white" : "py-20 sm:py-28"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Set up in{" "}
            <span className={dark ? "text-blue-400" : "text-primary"}>
              under two minutes.
            </span>
          </h2>
          <p className={`mt-4 text-lg ${dark ? "text-zinc-400" : "text-muted-foreground"} max-w-2xl mx-auto`}>
            No proxy, no VPN, no IT ticket. Install and your team is protected.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto relative">
          {/* Connecting line */}
          <div
            className={`hidden sm:block absolute top-12 left-[20%] right-[20%] h-px ${
              dark ? "bg-blue-500/30" : "bg-primary/20"
            }`}
          />

          {steps.map((item) => (
            <div key={item.step} className="relative text-center">
              <div
                className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-5 ${
                  dark
                    ? "bg-blue-500/10 border border-blue-500/20"
                    : "bg-primary/10 border border-primary/20"
                }`}
              >
                <item.icon
                  className={`h-7 w-7 ${dark ? "text-blue-400" : "text-primary"}`}
                />
              </div>
              <div
                className={`absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full text-xs font-bold tracking-widest ${
                  dark ? "text-blue-400/60" : "text-primary/60"
                }`}
              >
                {item.step}
              </div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p
                className={`mt-2 text-sm leading-relaxed max-w-xs mx-auto ${
                  dark ? "text-zinc-400" : "text-muted-foreground"
                }`}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
