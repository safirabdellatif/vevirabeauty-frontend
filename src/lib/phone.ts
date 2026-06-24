export interface NormalizedMoroccanPhone {
  local: string;    // 06XXXXXXXX or 07XXXXXXXX
  e164: string;     // +2126XXXXXXXX or +2127XXXXXXXX
  digitsWithCountryCode: string; // 2126XXXXXXXX or 2127XXXXXXXX
}

// Keep backward-compatible type alias
export type NormalizedSaudiPhone = NormalizedMoroccanPhone;

const TEST_PHONE = "0600000000";

export function normalizeMoroccanPhone(raw: string): NormalizedMoroccanPhone | null {
  const stripped = raw.replace(/\D/g, "");

  // Test phone whitelist
  if (stripped === TEST_PHONE) {
    return {
      local: "0600000000",
      e164: "+212600000000",
      digitsWithCountryCode: "212600000000",
    };
  }

  let national: string | null = null;

  if (stripped.startsWith("212") && stripped.length === 12) {
    national = stripped.slice(3); // 2126XXXXXXXX -> 6XXXXXXXX
  } else if (stripped.startsWith("0") && stripped.length === 10) {
    national = stripped.slice(1); // 06XXXXXXXX -> 6XXXXXXXX
  } else if (stripped.length === 9) {
    national = stripped; // 6XXXXXXXX
  }

  if (!national) return null;
  if (!/^[67][0-9]{8}$/.test(national)) return null;

  return {
    local: "0" + national,
    e164: "+212" + national,
    digitsWithCountryCode: "212" + national,
  };
}

// Backward-compatible alias
export const normalizeSaudiPhone = normalizeMoroccanPhone;

export function isValidSaudiPhone(raw: string): boolean {
  return normalizeMoroccanPhone(raw) !== null;
}
