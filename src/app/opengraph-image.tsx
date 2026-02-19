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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 320.9" fill="none"><circle cx="157.7" cy="167.7" r="23.2" fill="white"/><circle cx="279.7" cy="167.7" r="23.2" fill="white"/><path fill="white" d="M351.4,68.2c-21.3-10.5-52.4-13.8-77.1-23.6-33-13-46.9-25.1-55.8-25.1s-16.8,8.2-49.1,21.6c-25.9,10.8-49.8,16.2-68,21.1C51.1,72.3,13.2,116.6,13.2,169.8v17.8c0,60.6,49.1,109.7,109.7,109.7h221.8s-12.9-51.6-56.3-51.6h-150c-38.5,0-69.8-31.8-69.8-71.1v-.5c0-39.3,31.2-71.1,69.8-71.1h150.2c38.5,0,69.8,31.8,69.8,71.1v.5c0,1.5,0,2.9-.1,4.3-.9,16-1.4,84.7-1.5,107.8,37.2-17.6,62.9-55.3,62.9-99.1v-17.8c0-46-28.3-85.4-68.5-101.7Z"/></svg>')}`}
            alt=""
            width={56}
            height={42}
            style={{ objectFit: "contain" }}
          />
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
