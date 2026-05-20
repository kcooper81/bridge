"use client";

/**
 * Simple password strength meter — 4 buckets: too short / weak / fair / strong.
 * Based on length + character class diversity. Not a substitute for zxcvbn,
 * but enough to nudge users away from "password1234".
 */
export function PasswordStrengthMeter({ value }: { value: string }) {
  const score = computeScore(value);
  const labels = ["Too short", "Weak", "Fair", "Strong"];
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-emerald-500",
  ];

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= score ? colors[score] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {labels[score]}
        {score < 3 && " — longer is stronger; a passphrase of four+ random words beats complex short passwords."}
      </p>
    </div>
  );
}

function computeScore(pw: string): 0 | 1 | 2 | 3 {
  if (pw.length < 10) return 0;
  // NIST SP 800-63B prefers length over forced character-class diversity.
  // 20+ characters is strong on its own (passphrase pattern) regardless of mix.
  if (pw.length >= 20) return 3;
  let classes = 0;
  if (/[a-z]/.test(pw)) classes++;
  if (/[A-Z]/.test(pw)) classes++;
  if (/\d/.test(pw)) classes++;
  if (/[^A-Za-z0-9]/.test(pw)) classes++;
  if (pw.length >= 16 && classes >= 3) return 3;
  if (pw.length >= 12 && classes >= 2) return 2;
  return 1;
}
