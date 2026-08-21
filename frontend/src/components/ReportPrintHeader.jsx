import Logo from "./Logo";

export default function ReportPrintHeader({ title, periodLabel, subtitle }) {
  const generatedAt = new Date().toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="report-print-header">
      <div className="report-print-brand">
        <Logo size={56} />
        <div>
          <h2>MBALA KWA SELEMANI</h2>
          <p>Gestion congelé</p>
        </div>
      </div>
      <div className="report-print-meta">
        <h1>{title}</h1>
        {subtitle && <p className="report-print-subtitle">{subtitle}</p>}
        <div className="report-print-period">{periodLabel}</div>
        <div className="report-print-date">Généré le {generatedAt}</div>
      </div>
    </div>
  );
}
