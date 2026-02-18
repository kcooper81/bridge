import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TeamPrompt — AI Prompt Management for Teams";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Gradient accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: "800",
              color: "white",
            }}
          >
            T
          </div>
          <span
            style={{
              fontSize: "36px",
              fontWeight: "800",
              color: "white",
              letterSpacing: "-0.5px",
            }}
          >
            TeamPrompt
          </span>
        </div>

        {/* Tagline */}
        <h1
          style={{
            fontSize: "52px",
            fontWeight: "800",
            color: "white",
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: "800px",
            letterSpacing: "-1px",
            margin: 0,
          }}
        >
          AI Prompt Management
          <br />
          <span style={{ color: "#3b82f6" }}>for Teams</span>
        </h1>

        <p
          style={{
            fontSize: "22px",
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: "600px",
            marginTop: "20px",
            lineHeight: 1.5,
          }}
        >
          Shared libraries, quality guidelines, and security guardrails
        </p>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            display: "flex",
            gap: "24px",
            color: "#71717a",
            fontSize: "16px",
          }}
        >
          <span>teamprompt.app</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
