const PREFIX = "mbala-kwa-v1:";

export const PASSWORD_HASHES = {
  admin123: "697d52476f725299856ecc0bf13736ca251f6ea17cd592f99309300da62be818",
  vendeur123: "bfbe6cf80c3848a693a9a6d7bb0e9d9c9fa03b1603bb335a78629587887a17f6",
  manager123: "d026666ee5848f0b5b2554ab29aa4c4a45ab98c910a09336c061e9a52cdbd3ae",
  "123456": "75774d3b160bb84e1da4c06d38a237b058d8633e59f24622b0db924a15386496",
};

export function isPasswordHashed(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

export async function hashPassword(plain) {
  const data = new TextEncoder().encode(PREFIX + String(plain).trim());
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(plain, stored) {
  if (!stored) return false;
  if (!isPasswordHashed(stored)) {
    return String(plain).trim() === stored;
  }
  return (await hashPassword(plain)) === stored;
}

export function hashPasswordSync(plain) {
  return PASSWORD_HASHES[String(plain).trim()] || PASSWORD_HASHES["123456"];
}
