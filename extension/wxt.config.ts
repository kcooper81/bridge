import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  outDir: "dist",
  manifestVersion: 3,
  manifest: ({ browser }) => {
    const isFirefox = browser === "firefox";

    const permissions = isFirefox
      ? ["storage", "activeTab", "alarms"]
      : ["storage", "activeTab", "alarms", "sidePanel"];

    return {
      name: "TeamPrompt",
      version: "1.0.0",
      description:
        "Access your team's prompt library, scan for sensitive data, and log AI conversations.",
      permissions,
      host_permissions: [
        "https://chat.openai.com/*",
        "https://chatgpt.com/*",
        "https://claude.ai/*",
        "https://gemini.google.com/*",
        "https://github.com/copilot/*",
        "https://copilot.microsoft.com/*",
        "https://www.perplexity.ai/*",
        "https://teamprompt.app/*",
      ],
      // Firefox doesn't support externally_connectable
      ...(isFirefox
        ? {}
        : {
            externally_connectable: {
              matches: [
                "https://teamprompt.app/*",
                "http://localhost:3000/*",
              ],
            },
          }),
    };
  },
});
