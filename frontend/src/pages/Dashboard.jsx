import { Table } from "react-bootstrap";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import SmartInsights from "../components/SmartInsights";
import { useApp } from "../data/AppContext";
import { getChartTheme } from "../utils/chartTheme";
import { formatCdfAsUsd, normalizeSettings } from "../utils/settings";
import { PERMISSIONS } from "../utils/permissions";
import { sumStockByCategory } from "../utils/ids";
import { localDateKey, isSameLocalDay, isoToLocalDateKey } from "../utils/localDate";

export default function Dashboard() {
  const { data, formatMoney, stockStatus, getCategoryName, can, formatDate } = useApp();
  const settings = normalizeSettings(data.settings);
  const chart = getChartTheme(settings.theme === "dark");
  const totalStock = data.products.reduce((s, p) => s + p.stock, 0);
  const lowStock = data.products.filter((p) => stockStatus(p) !== "ok");
  const salesTotalCdf = data.sales.reduce((s, sale) => s + sale.total, 0);
  const todayKey = localDateKey();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayKey = localDateKey(yesterdayDate);
  const todaySales = data.sales.filter((sale) =>
    isSameLocalDay(sale.created_at, todayKey)
  );
  const yesterdaySales = data.sales.filter((sale) =>
    isSameLocalDay(sale.created_at, yesterdayKey)
  );
  const todayTotalCdf = todaySales.reduce((s, sale) => s + sale.total, 0);
  const yesterdayTotalCdf = yesterdaySales.reduce((s, sale) => s + sale.total, 0);
  const salesTrend =
    yesterdayTotalCdf > 0
      ? Math.round(((todayTotalCdf - yesterdayTotalCdf) / yesterdayTotalCdf) * 100)
      : null;
  const recentLogs = (data.activityLogs || []).slice(0, 5);

  const salesByDay = Object.values(
    data.sales.reduce((acc, sale) => {
      const day = isoToLocalDateKey(sale.created_at);
      if (!day) return acc;
      acc[day] = acc[day] || { day, total: 0 };
      acc[day].total += sale.total;
      return acc;
    }, {})
  ).sort((a, b) => a.day.localeCompare(b.day));

  const stockByCategory = data.categories
    .map((cat) => ({
      name: cat.name,
      stock: sumStockByCategory(data.products, cat.id),
    }))
    .filter((entry) => entry.stock > 0);

  const quickActions = [
    can(PERMISSIONS.salesDetail) && {
      to: "/ventes/detail",
      icon: "bi-shop-window",
      label: "Caisse détail",
    },
    can(PERMISSIONS.salesCart) && {
      to: "/ventes/panier",
      icon: "bi-basket",
      label: "Panier",
      badge: data.cart?.length || 0,
    },
    can(PERMISSIONS.stockView) && {
      to: "/stock/disponible",
      icon: "bi-boxes",
      label: "Stock",
    },
    can(PERMISSIONS.billingHistory) && {
      to: "/facturation/historique",
      icon: "bi-receipt-cutoff",
      label: "Factures",
    },
  ].filter(Boolean);

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        subtitle="L’essentiel du jour — caisse, stock et alertes."
        badge="Aujourd’hui"
      />

      <SmartInsights />

      <div className="bento-dashboard">
        <section className="bento-tile bento-hero liquid-glass">
          <div className="bento-hero-label">Ventes du jour</div>
          <div className="bento-hero-value">{formatMoney(todayTotalCdf)}</div>
          <div className="bento-hero-meta">
            {todaySales.length} ticket{todaySales.length !== 1 ? "s" : ""}
            {salesTrend !== null && (
              <span className={`stat-trend ${salesTrend >= 0 ? "up" : "down"}`}>
                {" "}
                · {salesTrend >= 0 ? "+" : ""}
                {salesTrend}% vs hier
              </span>
            )}
          </div>
          {can(PERMISSIONS.salesDetail) && (
            <Link to="/ventes/detail" className="bento-hero-cta">
              Ouvrir la caisse <i className="bi bi-arrow-right" />
            </Link>
          )}
        </section>

        <section className="bento-tile bento-stat">
          <div className="stat-label">Stock (unités)</div>
          <div className="stat-value">{totalStock}</div>
          <div className="stat-hint">{data.products.length} références</div>
        </section>

        <section className="bento-tile bento-stat bento-stat-amber">
          <div className="stat-label">Alertes stock</div>
          <div className="stat-value">{lowStock.length}</div>
          <div className="stat-hint">
            {lowStock.length === 0 ? "Tout va bien" : "À réapprovisionner"}
          </div>
        </section>

        <section className="bento-tile bento-stat">
          <div className="stat-label">CA cumulé</div>
          <div className="stat-value stat-value-sm">{formatMoney(salesTotalCdf)}</div>
          <div className="stat-hint">
            {settings.currency === "USD"
              ? `${salesTotalCdf.toLocaleString("fr-FR")} FC`
              : formatCdfAsUsd(salesTotalCdf, settings)}
          </div>
        </section>

        {quickActions.length > 0 && (
          <section className="bento-tile bento-actions">
            <h3 className="panel-title">Accès rapide</h3>
            <div className="bento-action-row">
              {quickActions.map((action) => (
                <Link key={action.to} to={action.to} className="bento-action">
                  <i className={`bi ${action.icon}`} />
                  <span>{action.label}</span>
                  {action.badge > 0 && (
                    <em className="bento-action-badge">{action.badge}</em>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="bento-tile bento-chart">
          <h3 className="panel-title">Évolution des ventes</h3>
          {salesByDay.length === 0 ? (
            <div className="empty-state-modern chart-empty">
              <i className="bi bi-graph-up" />
              <h3>Pas encore de ventes</h3>
              <p>Les encaissements du jour apparaîtront ici.</p>
            </div>
          ) : (
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesByDay}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chart.primary} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={chart.primary} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: chart.tick }} />
                  <YAxis
                    tick={{ fontSize: 12, fill: chart.tick }}
                    tickFormatter={(v) => formatMoney(v)}
                  />
                  <Tooltip
                    formatter={(v) => formatMoney(v)}
                    contentStyle={{
                      background: settings.theme === "dark" ? "#0f1f1a" : "#fff",
                      border: `1px solid ${chart.grid}`,
                      borderRadius: 12,
                      color: chart.tick,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke={chart.primary}
                    fill="url(#salesFill)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="bento-tile bento-chart-sm liquid-glass">
          <h3 className="panel-title">Stock par catégorie</h3>
          {stockByCategory.length === 0 ? (
            <div className="empty-state-modern chart-empty">
              <i className="bi bi-bar-chart" />
              <h3>Aucun stock</h3>
              <p>Ajoutez des produits pour alimenter ce graphique.</p>
            </div>
          ) : (
            <div className="chart-box chart-box-sm">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: chart.tick }} />
                  <YAxis tick={{ fontSize: 11, fill: chart.tick }} />
                  <Tooltip
                    contentStyle={{
                      background: settings.theme === "dark" ? "#0f1f1a" : "#fff",
                      border: `1px solid ${chart.grid}`,
                      borderRadius: 12,
                      color: chart.tick,
                    }}
                  />
                  <Bar dataKey="stock" fill={chart.ice} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="bento-tile bento-list">
          <div className="bento-list-head">
            <h3 className="panel-title mb-0">Tickets du jour</h3>
            {can(PERMISSIONS.reportsSales) && (
              <Link to="/rapports/ventes" className="stat-link">
                Voir rapports →
              </Link>
            )}
          </div>
          {todaySales.length === 0 ? (
            <div className="empty-state-modern">
              <i className="bi bi-receipt" />
              <h3>Aucune vente aujourd’hui</h3>
              <p>Ouvrez la caisse pour enregistrer le premier ticket.</p>
            </div>
          ) : (
            <Table responsive hover size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Client</th>
                  <th>Heure</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {todaySales.slice(0, 8).map((sale) => (
                  <tr key={sale.id}>
                    <td className="fw-semibold">{sale.number}</td>
                    <td>{sale.client_name || "Client passage"}</td>
                    <td>
                      {sale.created_at
                        ? new Date(sale.created_at).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="text-end fw-semibold">{formatMoney(sale.total)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </section>

        <section className="bento-tile bento-alerts">
          <h3 className="panel-title">Alertes stock froid</h3>
          {lowStock.length === 0 ? (
            <div className="empty-state-modern">
              <i className="bi bi-check-circle" />
              <h3>Stock sous contrôle</h3>
              <p>Aucune rupture ni seuil bas pour le moment.</p>
            </div>
          ) : (
            <ul className="bento-alert-list">
              {lowStock.slice(0, 6).map((p) => {
                const status = stockStatus(p);
                return (
                  <li key={p.id}>
                    <div>
                      <strong>{p.name}</strong>
                      <span>
                        {getCategoryName(p.category_id)} · {p.stock} {p.unit}
                      </span>
                    </div>
                    <span
                      className={`badge-stock ${
                        status === "out" ? "badge-out" : "badge-low"
                      }`}
                    >
                      {status === "out" ? "Rupture" : "Faible"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {can(PERMISSIONS.reportsSales) && (
          <section className="bento-tile bento-activity">
            <h3 className="panel-title">Activité récente</h3>
            {recentLogs.length === 0 ? (
              <p className="text-muted mb-0">Aucune activité récente.</p>
            ) : (
              <ul className="activity-log-list mb-0">
                {recentLogs.map((log) => (
                  <li key={log.id}>
                    <div className="activity-log-summary">{log.summary}</div>
                    <div className="activity-log-meta">
                      {log.user_name} · {formatDate(log.created_at)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </>
  );
}
