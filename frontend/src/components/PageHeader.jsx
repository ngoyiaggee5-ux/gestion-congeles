export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header d-flex flex-wrap justify-content-between align-items-start gap-3">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="d-flex gap-2 flex-wrap no-print">{actions}</div>}
    </div>
  );
}
