import {
  ADVICE_LEVEL_ICONS,
  ADVICE_LEVEL_LABELS,
} from "../utils/reportAdvice";

export default function ReportAdvice({ items = [] }) {
  if (!items.length) return null;

  return (
    <div className="panel mb-3 report-advice-panel">
      <h3 className="panel-title">
        <i className="bi bi-lightbulb me-2" />
        Conseils &amp; analyse
      </h3>
      <ul className="report-advice-list">
        {items.map((item, index) => (
          <li
            key={`${item.title}-${index}`}
            className={`report-advice-item report-advice-${item.level || "info"}`}
          >
            <div className="report-advice-icon">
              <i
                className={`bi ${ADVICE_LEVEL_ICONS[item.level] || ADVICE_LEVEL_ICONS.info}`}
              />
            </div>
            <div className="report-advice-body">
              <div className="report-advice-head">
                <strong>{item.title}</strong>
                <span className="report-advice-badge">
                  {ADVICE_LEVEL_LABELS[item.level] || "Conseil"}
                </span>
              </div>
              <p>{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
