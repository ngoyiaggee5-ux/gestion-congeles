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
import { useApp } from "../../data/AppContext";
import { getChartTheme } from "../../utils/chartTheme";
import { filterByPeriod } from "../../utils/reportPeriod";
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

  const pie = data.categories.map((c) => ({
    name: c.name,
    value: data.products
      .filter((p) => p.category_id === c.id)
      .reduce((s, p) => s + p.stock, 0),
  }));

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

        <div className="panel mb-3 no-print">
          <h3 className="panel-title">Répartition par catégorie</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" outerRadius={100} label>
                  {pie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: dark ? "#0f1f1a" : "#fff",
                    border: `1px solid ${chart.grid}`,
                    borderRadius: 12,
                    color: chart.tick,
                  }}
                />
                <Legend wrapperStyle={{ color: chart.tick }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
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
