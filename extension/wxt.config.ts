import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  outDir: "dist",
  manifestVersion: 3,
  hooks: {
    "vite:build:extendConfig"(_entries, config) {
      // Remove content hashes — Firefox Add-ons rejects hashed filenames
      if (config.build?.rollupOptions?.output) {
        const output = config.build.rollupOptions.output;
        if (!Array.isArray(output)) {
          if (typeof output.chunkFileNames === "string") {
            output.chunkFileNames = output.chunkFileNames.replace("-[hash]", "");
          }
          if (typeof output.assetFileNames === "string") {
            output.assetFileNames = output.assetFileNames.replace("-[hash]", "");
          }
          if (typeof output.entryFileNames === "function") {
            const original = output.entryFileNames;
            output.entryFileNames = (chunkInfo) => {
              return (original(chunkInfo) as string).replace("-[hash]", "");
            };
          } else if (typeof output.entryFileNames === "string") {
            output.entryFileNames = output.entryFileNames.replace("-[hash]", "");
          }
        }
      }
    },
  },
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
      // Firefox-specific settings
      ...(isFirefox
        ? {
            browser_specific_settings: {
              gecko: {
                id: "extension@teamprompt.app",
                strict_min_version: "140.0",
                data_collection_permissions: {
                  is_data_collected: false,
                  required: false,
                },
              },
            },
          }
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
