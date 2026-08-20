import { Row, Col, Table, Badge } from "react-bootstrap";
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
import { useApp } from "../data/AppContext";

export default function Dashboard() {
  const { data, formatMoney, stockStatus, getCategoryName } = useApp();
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
      />

      <div className="stat-grid mb-4">
        <div className="stat-card">
          <div className="stat-label">Produits en stock</div>
          <div className="stat-value">{totalStock}</div>
          <div className="stat-hint">{data.products.length} références</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ventes cumulées</div>
          <div className="stat-value" style={{ fontSize: "1.25rem" }}>
            {formatMoney(salesTotal)}
          </div>
          <div className="stat-hint">{data.sales.length} tickets</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Alertes stock</div>
          <div className="stat-value">{lowStock.length}</div>
          <div className="stat-hint">À réapprovisionner</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Clients</div>
          <div className="stat-value">{clients}</div>
          <div className="stat-hint">
            <Link to="/clients">Gérer les clients</Link>
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
                      <stop offset="0%" stopColor="#0b6e4f" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0b6e4f" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d7e5de" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => formatMoney(v)} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#0b6e4f"
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#d7e5de" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="stock" fill="#1a9bb8" radius={[8, 8, 0, 0]} />
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
