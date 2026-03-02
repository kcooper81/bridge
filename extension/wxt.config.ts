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
      name: "TeamPrompt — AI Prompt Manager & DLP Shield",
      version: "1.0.0",
      description:
        "Access your team's prompt library, scan for sensitive data, and log AI conversations.",
      icons: {
        16: "/icons/icon-16.png",
        32: "/icons/icon-32.png",
        48: "/icons/icon-48.png",
        128: "/icons/icon-128.png",
      },
      permissions,
      commands: {
        _execute_action: {
          suggested_key: {
            default: "Ctrl+Shift+P",
            mac: "Command+Shift+P",
          },
          description: "Open TeamPrompt",
        },
      },
      host_permissions: [
        "https://chat.openai.com/*",
        "https://chatgpt.com/*",
        "https://claude.ai/*",
        "https://gemini.google.com/*",
        "https://github.com/copilot/*",
        "https://copilot.microsoft.com/*",
        "https://www.perplexity.ai/*",
        "https://teamprompt.app/*",
        "https://www.teamprompt.app/*",
      ],
      // Firefox doesn't support externally_connectable
      ...(isFirefox
        ? {}
        : {
            externally_connectable: {
              matches: [
                "https://teamprompt.app/*",
                "https://www.teamprompt.app/*",
              ],
            },
          }),
    };
  },
});
