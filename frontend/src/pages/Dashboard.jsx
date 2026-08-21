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

export default function Dashboard() {
  const { data, formatMoney, stockStatus, getCategoryName } = useApp();
  const chart = getChartTheme(data.settings?.theme === "dark");
  const totalStock = data.products.reduce((s, p) => s + p.stock, 0);
  const lowStock = data.products.filter((p) => stockStatus(p) !== "ok");
  const salesTotal = data.sales.reduce((s, sale) => s + sale.total, 0);
  const clients = data.clients.length;

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
            <i className="bi bi-graph-up-arrow" />
          </div>
          <div className="stat-label">Ventes cumulées</div>
          <div className="stat-value stat-value-sm">{formatMoney(salesTotal)}</div>
          <div className="stat-hint">{data.sales.length} tickets</div>
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
                  <YAxis tick={{ fontSize: 12, fill: chart.tick }} />
                  <Tooltip
                    formatter={(v) => formatMoney(v)}
                    contentStyle={{
                      background: data.settings?.theme === "dark" ? "#0f1f1a" : "#fff",
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
