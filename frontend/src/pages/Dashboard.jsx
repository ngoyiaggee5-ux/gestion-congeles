import { Row, Col, Table } from "react-bootstrap";
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

export default function Dashboard() {
  const { data, formatMoney, stockStatus, getCategoryName, can, formatDate } = useApp();
  const settings = normalizeSettings(data.settings);
  const chart = getChartTheme(settings.theme === "dark");
  const totalStock = data.products.reduce((s, p) => s + p.stock, 0);
  const lowStock = data.products.filter((p) => stockStatus(p) !== "ok");
  const salesTotalCdf = data.sales.reduce((s, sale) => s + sale.total, 0);
  const clients = data.clients.length;
  const todayKey = new Date().toISOString().slice(0, 10);
  const todaySales = data.sales.filter((sale) =>
    (sale.created_at || "").startsWith(todayKey)
  );
  const todayTotalCdf = todaySales.reduce((s, sale) => s + sale.total, 0);
  const recentLogs = (data.activityLogs || []).slice(0, 8);

  const salesByDay = Object.values(
    data.sales.reduce((acc, sale) => {
      const day = sale.created_at.slice(0, 10);
      acc[day] = acc[day] || { day, total: 0 };
      acc[day].total += sale.total;
      return acc;
    }, {})
  );

  const stockByCategory = data.categories.map((cat) => ({
    name: cat.name,
    stock: data.products
      .filter((p) => p.category_id === cat.id)
      .reduce((s, p) => s + p.stock, 0),
  }));

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d’ensemble de votre congélateur commercial MBALA KWA SELEMANI."
        badge="Aujourd’hui"
      />

      <SmartInsights />

      <div className="stat-grid mb-4">
        <div className="stat-card stat-card-green">
          <div className="stat-icon">
            <i className="bi bi-box-seam" />
          </div>
          <div className="stat-label">Produits en stock</div>
          <div className="stat-value">{totalStock}</div>
          <div className="stat-hint">{data.products.length} références</div>
        </div>
        <div className="stat-card stat-card-ice">
          <div className="stat-icon">
            <i className="bi bi-calendar-day" />
          </div>
          <div className="stat-label">Ventes du jour</div>
          <div className="stat-value stat-value-sm">{formatMoney(todayTotalCdf)}</div>
          <div className="stat-hint">
            {todaySales.length} ticket{todaySales.length !== 1 ? "s" : ""} aujourd’hui
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-graph-up-arrow" />
          </div>
          <div className="stat-label">Ventes cumulées</div>
          <div className="stat-value stat-value-sm">{formatMoney(salesTotalCdf)}</div>
          <div className="stat-hint">
            {data.sales.length} ticket{data.sales.length !== 1 ? "s" : ""}
            {salesTotalCdf > 0 && (
              <>
                {" "}
                ·{" "}
                {settings.currency === "USD"
                  ? `${salesTotalCdf.toLocaleString("fr-FR")} FC`
                  : formatCdfAsUsd(salesTotalCdf, settings)}
              </>
            )}
          </div>
        </div>
        <div className="stat-card stat-card-amber">
          <div className="stat-icon">
            <i className="bi bi-exclamation-triangle" />
          </div>
          <div className="stat-label">Alertes stock</div>
          <div className="stat-value">{lowStock.length}</div>
          <div className="stat-hint">À réapprovisionner</div>
        </div>
        <div className="stat-card stat-card-purple">
          <div className="stat-icon">
            <i className="bi bi-people" />
          </div>
          <div className="stat-label">Clients</div>
          <div className="stat-value">{clients}</div>
          <div className="stat-hint">
            <Link to="/clients" className="stat-link">
              Gérer les clients →
            </Link>
          </div>
        </div>
      </div>

      <Row className="g-3 mb-3">
        <Col lg={can(PERMISSIONS.reportsSales) ? 7 : 12}>
          <div className="panel">
            <h3 className="panel-title">Ventes du jour</h3>
            <Table responsive hover size="sm">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Client</th>
                  <th>Type</th>
                  <th>Heure</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {todaySales.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      Aucune vente enregistrée aujourd’hui.
                    </td>
                  </tr>
                )}
                {todaySales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="fw-semibold">{sale.number}</td>
                    <td>{sale.client_name || "Client passage"}</td>
                    <td className="text-capitalize">{sale.type}</td>
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
          </div>
        </Col>
        {can(PERMISSIONS.reportsSales) && (
          <Col lg={5}>
            <div className="panel">
              <h3 className="panel-title">Journal d’activité</h3>
              <ul className="activity-log-list mb-0">
                {recentLogs.length === 0 && (
                  <li className="text-muted">Aucune activité récente.</li>
                )}
                {recentLogs.map((log) => (
                  <li key={log.id}>
                    <div className="activity-log-summary">{log.summary}</div>
                    <div className="activity-log-meta">
                      {log.user_name} · {formatDate(log.created_at)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Col>
        )}
      </Row>

      <Row className="g-3 mb-3">
        <Col lg={7}>
          <div className="panel">
            <h3 className="panel-title">Évolution des ventes</h3>
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
          </div>
        </Col>
        <Col lg={5}>
          <div className="panel">
            <h3 className="panel-title">Stock par catégorie</h3>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: chart.tick }} />
                  <YAxis tick={{ fontSize: 12, fill: chart.tick }} />
                  <Tooltip
                    contentStyle={{
                      background: data.settings?.theme === "dark" ? "#0f1f1a" : "#fff",
                      border: `1px solid ${chart.grid}`,
                      borderRadius: 12,
                      color: chart.tick,
                    }}
                  />
                  <Bar dataKey="stock" fill={chart.ice} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>
      </Row>

      <div className="panel">
        <h3 className="panel-title">Alertes de stock froid</h3>
        <Table responsive hover>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Stock</th>
              <th>Seuil</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {lowStock.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-state">
                  Aucune alerte — stock sous contrôle.
                </td>
              </tr>
            )}
            {lowStock.map((p) => {
              const status = stockStatus(p);
              return (
                <tr key={p.id}>
                  <td className="fw-semibold">{p.name}</td>
                  <td>{getCategoryName(p.category_id)}</td>
                  <td>
                    {p.stock} {p.unit}
                  </td>
                  <td>{p.min_stock}</td>
                  <td>
                    <span
                      className={`badge-stock ${
                        status === "out" ? "badge-out" : "badge-low"
                      }`}
                    >
                      {status === "out" ? "Rupture" : "Faible"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </>
  );
}
