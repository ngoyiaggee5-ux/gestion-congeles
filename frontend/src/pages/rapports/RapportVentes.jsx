import { Table } from "react-bootstrap";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import PageHeader from "../../components/PageHeader";
import ReportPeriodFilter from "../../components/ReportPeriodFilter";
import ReportPrintHeader from "../../components/ReportPrintHeader";
import { useApp } from "../../data/AppContext";
import { getChartTheme } from "../../utils/chartTheme";
import { filterByPeriod } from "../../utils/reportPeriod";
import { useReportPeriod } from "../../hooks/useReportPeriod";

export default function RapportVentes() {
  const { data, formatMoney, formatDate, getClientDisplayName } = useApp();
  const chart = getChartTheme(data.settings?.theme === "dark");
  const periodState = useReportPeriod();

  const filteredSales = filterByPeriod(
    data.sales,
    "created_at",
    periodState.range
  );

  const byType = [
    {
      name: "Détail",
      total: filteredSales
        .filter((s) => s.type === "détail")
        .reduce((a, s) => a + s.total, 0),
    },
    {
      name: "Gros",
      total: filteredSales
        .filter((s) => s.type === "gros")
        .reduce((a, s) => a + s.total, 0),
    },
  ];

  const totalPeriod = filteredSales.reduce((s, sale) => s + sale.total, 0);

  return (
    <>
      <PageHeader
        title="Rapport ventes"
        subtitle="Analyse des ventes détail et gros par période."
      />

      <ReportPeriodFilter
        {...periodState}
        onPeriodChange={periodState.setPeriod}
        onReferenceDateChange={periodState.setReferenceDate}
        onCustomEndDateChange={periodState.setCustomEndDate}
        periodLabel={periodState.periodLabel}
        onPrint={() => window.print()}
        resultCount={filteredSales.length}
      />

      <div className="report-print-area">
        <ReportPrintHeader
          title="Rapport des ventes"
          periodLabel={periodState.periodLabel}
          subtitle={`Total période : ${formatMoney(totalPeriod)}`}
        />

        <div className="stat-grid mb-4 report-print-stats">
          <div className="stat-card stat-card-green">
            <div className="stat-label">Ventes période</div>
            <div className="stat-value">{filteredSales.length}</div>
          </div>
          <div className="stat-card stat-card-ice">
            <div className="stat-label">Chiffre d&apos;affaires</div>
            <div className="stat-value stat-value-sm">{formatMoney(totalPeriod)}</div>
          </div>
          <div className="stat-card stat-card-purple">
            <div className="stat-label">Détail</div>
            <div className="stat-value stat-value-sm">{formatMoney(byType[0].total)}</div>
          </div>
          <div className="stat-card stat-card-amber">
            <div className="stat-label">Gros</div>
            <div className="stat-value stat-value-sm">{formatMoney(byType[1].total)}</div>
          </div>
        </div>

        <div className="panel mb-3 no-print">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byType}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis dataKey="name" tick={{ fill: chart.tick }} />
                <YAxis tick={{ fill: chart.tick }} />
                <Tooltip
                  formatter={(v) => formatMoney(v)}
                  contentStyle={{
                    background: data.settings?.theme === "dark" ? "#0f1f1a" : "#fff",
                    border: `1px solid ${chart.grid}`,
                    borderRadius: 12,
                    color: chart.tick,
                  }}
                />
                <Bar dataKey="total" fill={chart.primary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title">Détail des ventes</h3>
          {filteredSales.length === 0 ? (
            <div className="empty-state">
              Aucune vente pour la période sélectionnée.
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Type</th>
                  <th>Client</th>
                  <th>Paiement</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((s) => (
                  <tr key={s.id}>
                    <td>{s.number}</td>
                    <td className="text-capitalize">{s.type}</td>
                    <td>{getClientDisplayName(s)}</td>
                    <td className="text-capitalize">{s.payment_method}</td>
                    <td>{formatMoney(s.total)}</td>
                    <td>{formatDate(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </>
  );
}
