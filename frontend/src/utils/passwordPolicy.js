export function validatePasswordStrength(password, { required = true } = {}) {
  const value = String(password || "").trim();
  if (!value) {
    return required ? "Le mot de passe est obligatoire." : null;
  }
  if (value.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
  }
  return null;
}
