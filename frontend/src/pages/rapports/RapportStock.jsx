import { Table } from "react-bootstrap";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import PageHeader from "../../components/PageHeader";
import ReportPeriodFilter from "../../components/ReportPeriodFilter";
import ReportPrintHeader from "../../components/ReportPrintHeader";
import ReportAdvice from "../../components/ReportAdvice";
import { useApp } from "../../data/AppContext";
import { getStockReportAdvice } from "../../utils/reportAdvice";
import { getChartTheme } from "../../utils/chartTheme";
import { filterByPeriod } from "../../utils/reportPeriod";
import { sumStockByCategory } from "../../utils/ids";
import { useReportPeriod } from "../../hooks/useReportPeriod";

const COLORS_LIGHT = ["#0b6e4f", "#1a9bb8", "#d97706", "#64748b"];
const COLORS_DARK = ["#34d399", "#67e8f9", "#fbbf24", "#94a3b8"];

export default function RapportStock() {
  const { data, getCategoryName, formatMoney, stockStatus, getProduct, formatDate } =
    useApp();
  const dark = data.settings?.theme === "dark";
  const chart = getChartTheme(dark);
  const COLORS = dark ? COLORS_DARK : COLORS_LIGHT;
  const periodState = useReportPeriod();

  const filteredMovements = filterByPeriod(
    data.stockMovements,
    "created_at",
    periodState.range
  );

  const pie = data.categories
    .map((category) => ({
      name: category.name,
      value: sumStockByCategory(data.products, category.id),
    }))
    .filter((entry) => entry.value > 0);

  const pieTotal = pie.reduce((sum, entry) => sum + entry.value, 0);

  const valeur = data.products.reduce(
    (s, p) => s + p.stock * p.price_wholesale,
    0
  );

  const entrees = filteredMovements
    .filter((m) => m.type === "entrée")
    .reduce((s, m) => s + m.quantity, 0);
  const sorties = filteredMovements
    .filter((m) => m.type === "sortie")
    .reduce((s, m) => s + m.quantity, 0);

  const advice = getStockReportAdvice({
    data,
    stockStatus,
    filteredMovements,
    entrees,
    sorties,
    valeur,
    formatMoney,
  });

  return (
    <>
      <PageHeader
        title="Rapport stock"
        subtitle="État du stock et mouvements par période."
      />

      <ReportPeriodFilter
        {...periodState}
        onPeriodChange={periodState.setPeriod}
        onReferenceDateChange={periodState.setReferenceDate}
        onCustomEndDateChange={periodState.setCustomEndDate}
        periodLabel={periodState.periodLabel}
        onPrint={() => window.print()}
        resultCount={filteredMovements.length}
      />

      <div className="report-print-area">
        <ReportPrintHeader
          title="Rapport de stock"
          periodLabel={periodState.periodLabel}
          subtitle={`Valeur actuelle (coût gros) : ${formatMoney(valeur)}`}
        />

        <div className="stat-grid mb-4 report-print-stats">
          <div className="stat-card stat-card-green">
            <div className="stat-label">Valeur stock actuel</div>
            <div className="stat-value stat-value-sm">{formatMoney(valeur)}</div>
          </div>
          <div className="stat-card stat-card-ice">
            <div className="stat-label">Entrées (période)</div>
            <div className="stat-value">{entrees}</div>
          </div>
          <div className="stat-card stat-card-amber">
            <div className="stat-label">Sorties (période)</div>
            <div className="stat-value">{sorties}</div>
          </div>
          <div className="stat-card stat-card-purple">
            <div className="stat-label">Mouvements</div>
            <div className="stat-value">{filteredMovements.length}</div>
          </div>
        </div>

        <ReportAdvice items={advice} />

        <div className="panel mb-3 no-print liquid-glass">
          <h3 className="panel-title">Répartition par catégorie</h3>
          {pie.length === 0 ? (
            <div className="empty-state-modern chart-empty">
              <i className="bi bi-pie-chart" />
              <h3>Aucune donnée à afficher</h3>
              <p>
                {data.categories.length === 0
                  ? "Ajoutez des catégories et des produits pour voir la répartition."
                  : "Le stock est vide ou non réparti par catégorie."}
              </p>
            </div>
          ) : (
            <div className="chart-box chart-box-pie">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={96}
                    paddingAngle={3}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pie.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} unités`, "Stock"]}
                    contentStyle={{
                      background: dark ? "rgba(15, 31, 26, 0.92)" : "rgba(255,255,255,0.92)",
                      border: `1px solid ${chart.grid}`,
                      borderRadius: 12,
                      color: chart.tick,
                      backdropFilter: "blur(12px)",
                    }}
                  />
                  <Legend wrapperStyle={{ color: chart.tick }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-pie-total">
                Total stock
                <strong>{pieTotal}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="panel mb-3">
          <h3 className="panel-title">Mouvements de stock (période)</h3>
          {filteredMovements.length === 0 ? (
            <div className="empty-state">
              Aucun mouvement pour la période sélectionnée.
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Produit</th>
                  <th>Qté</th>
                  <th>Référence</th>
                  <th>Coût</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((m) => {
                  const product = getProduct(m.product_id);
                  return (
                    <tr key={m.id}>
                      <td>{formatDate(m.created_at)}</td>
                      <td className="text-capitalize">{m.type}</td>
                      <td>{product?.name || "—"}</td>
                      <td>{m.quantity}</td>
                      <td>{m.reference}</td>
                      <td>
                        {m.unit_cost ? formatMoney(m.unit_cost * m.quantity) : "—"}
                      </td>
                      <td>{m.note || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </div>

        <div className="panel">
          <h3 className="panel-title">État actuel du stock</h3>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Stock</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((p) => {
                const status = stockStatus(p);
                return (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{getCategoryName(p.category_id)}</td>
                    <td>
                      {p.stock} {p.unit}
                    </td>
                    <td>
                      <span
                        className={`badge-stock ${
                          status === "ok"
                            ? "badge-ok"
                            : status === "low"
                              ? "badge-low"
                              : "badge-out"
                        }`}
                      >
                        {status === "ok" ? "OK" : status === "low" ? "Faible" : "Rupture"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );
}
