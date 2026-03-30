import { Download, SlidersHorizontal, ShieldCheck } from "lucide-react";

export function GetStartedSteps({ dark = false }: { dark?: boolean }) {
  const steps = [
    {
      step: "1",
      title: "Install",
      desc: "Add the browser extension to Chrome, Edge, or Firefox — or deploy it to your whole team via MDM. No proxy or VPN needed.",
      icon: Download,
    },
    {
      step: "2",
      title: "Configure",
      desc: "Enable the compliance packs for your industry, set DLP rules, and add your team's prompts to the shared library.",
      icon: SlidersHorizontal,
    },
    {
      step: "3",
      title: "Protected",
      desc: "Every AI interaction is scanned in real time. Sensitive data is blocked before it leaves the browser. Your team has a full audit trail.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section
      className={dark ? "py-24 sm:py-32 bg-zinc-950 text-white" : "py-24 sm:py-32"}
      style={dark ? undefined : { background: "linear-gradient(180deg, #fff 0%, #F6F2FF 50%, #fff 100%)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
            How it works
          </h2>
          <p className={`mt-4 text-lg ${dark ? "text-zinc-400" : "text-muted-foreground"} max-w-2xl mx-auto`}>
            Three steps from install to full AI security coverage.
          </p>
        </div>

        <div className="grid gap-12 sm:grid-cols-3 max-w-4xl mx-auto">
          {steps.map((item) => (
            <div key={item.step} className="text-center">
              <div className="relative inline-block mb-6">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-[16px] ${
                    dark
                      ? "bg-white/10"
                      : "bg-foreground/[0.04] border border-foreground/[0.06]"
                  }`}
                >
                  <item.icon
                    className={`h-6 w-6 ${dark ? "text-white/70" : "text-foreground/50"}`}
                  />
                </div>
                <span
                  className={`absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                    dark
                      ? "bg-white text-zinc-900"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {item.step}
                </span>
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
