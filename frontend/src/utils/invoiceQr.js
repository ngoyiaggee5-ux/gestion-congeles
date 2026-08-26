export function getInvoiceVerifyUrl(invoiceNumber, verificationCode) {
  const base =
    typeof window !== "undefined" ? window.location.origin : "";
  const params = new URLSearchParams({ n: invoiceNumber });
  if (verificationCode) {
    params.set("c", verificationCode);
  }
  return `${base}/verifier-facture?${params.toString()}`;
}

export function buildInvoiceQrPayload(invoice) {
  return getInvoiceVerifyUrl(invoice.number, invoice.verification_code);
}
