export default function Logo({ className = "", size = 42, rounded = true }) {
  return (
    <img
      src="/Logo.jpg"
      alt="MBALA KWA SELEMANI"
      className={`brand-logo ${rounded ? "brand-logo-rounded" : ""} ${className}`.trim()}
      width={size}
      height={size}
    />
  );
}
