export default function PageHeader({ title, subtitle, actions, badge }) {
  return (
    <div className="page-header">
      <div className="page-header-inner d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div className="page-header-text">
          {badge && <span className="page-header-badge">{badge}</span>}
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actions && (
          <div className="page-header-actions d-flex gap-2 flex-wrap no-print">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
