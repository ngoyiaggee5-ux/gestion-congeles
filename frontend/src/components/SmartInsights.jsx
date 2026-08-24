import { Link } from "react-router-dom";
import { useApp } from "../data/AppContext";

const SEVERITY_LABELS = {
  rupture: "Rupture",
  faible: "Stock faible",
  info: "Info",
  succes: "Succès",
  neutre: "Conseil",
};

export default function SmartInsights() {
  const { getSmartInsights, formatMoney, canAccessRoute } = useApp();
  const insights = getSmartInsights().filter(
    (item) => !item.to || canAccessRoute(item.to)
  );

  if (!insights.length) return null;

  return (
    <div className="panel mb-4 smart-insights-panel">
      <h3 className="panel-title">
        <i className="bi bi-lightbulb me-2" />
        Suggestions intelligentes
      </h3>
      <div className="smart-insights-grid">
        {insights.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className={`smart-insight smart-insight-${item.type}`}
          >
            <div className="smart-insight-icon">
              <span
                className={`smart-insight-voyant smart-insight-voyant-${item.type}`}
                title={SEVERITY_LABELS[item.severity] || item.type}
                aria-hidden
              />
              <i className={`bi ${item.icon}`} />
            </div>
            <div className="smart-insight-body">
              <div className="smart-insight-title">{item.title}</div>
              <div className="smart-insight-text">{item.text}</div>
              {item.extra != null && (
                <div className="smart-insight-extra">{formatMoney(item.extra)}</div>
              )}
              {item.to && (
                <Link to={item.to} className="smart-insight-action">
                  {item.action}
                  <i className="bi bi-arrow-right-short" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
