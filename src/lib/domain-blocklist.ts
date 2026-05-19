// Public webmail and disposable-email domains that should never be used
// as auto-join targets. Letting any user with a gmail.com address auto-join
// is effectively letting any human on the internet auto-join.
//
// This list is intentionally conservative — better to block legitimate
// outliers than to silently let an attacker into someone's org.

const BLOCKED_AUTO_JOIN_DOMAINS = new Set([
  // Public webmail
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "ymail.com",
  "rocketmail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "tutanota.com",
  "fastmail.com",
  "zoho.com",
  "gmx.com",
  "gmx.net",
  "yandex.com",
  "yandex.ru",
  "mail.ru",
  "qq.com",
  "163.com",
  "126.com",
  "sina.com",
  "naver.com",
  // Disposable / temp
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "trashmail.com",
  "tempmail.com",
  "throwaway.email",
  "yopmail.com",
  "dispostable.com",
  "maildrop.cc",
  "sharklasers.com",
]);

export function isBlockedAutoJoinDomain(domain: string): boolean {
  return BLOCKED_AUTO_JOIN_DOMAINS.has(domain.trim().toLowerCase());
}
