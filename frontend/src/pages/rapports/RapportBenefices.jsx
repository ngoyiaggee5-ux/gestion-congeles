import { useMemo } from "react";
import { Table } from "react-bootstrap";
import PageHeader from "../../components/PageHeader";
import ReportPeriodFilter from "../../components/ReportPeriodFilter";
import ReportPrintHeader from "../../components/ReportPrintHeader";
import ReportAdvice from "../../components/ReportAdvice";
import { useApp } from "../../data/AppContext";
import { getProfitReportAdvice } from "../../utils/reportAdvice";
import { filterByPeriod } from "../../utils/reportPeriod";
import { useReportPeriod } from "../../hooks/useReportPeriod";

export default function RapportBenefices() {
  const { data, formatMoney, getProduct, formatDate } = useApp();
  const periodState = useReportPeriod();

  const filteredSales = filterByPeriod(
    data.sales,
    "created_at",
    periodState.range
  );

  const rows = useMemo(
    () =>
      filteredSales.map((sale) => {
        const cost = sale.items.reduce((sum, item) => {
          const product = getProduct(item.product_id);
          const unitCost = product ? product.price_wholesale * 0.75 : 0;
          return sum + unitCost * item.quantity;
        }, 0);
        const profit = sale.total - cost;
        return {
          sale,
          cost,
          profit,
          margin: sale.total ? (profit / sale.total) * 100 : 0,
        };
      }),
    [filteredSales, getProduct]
  );

  const totalSales = rows.reduce((s, r) => s + r.sale.total, 0);
  const totalCost = rows.reduce((s, r) => s + r.cost, 0);
  const totalProfit = totalSales - totalCost;

  const advice = getProfitReportAdvice({
    rows,
    totalSales,
    totalProfit,
    formatMoney,
  });

  return (
    <>
      <PageHeader
        title="Estimation des bénéfices"
        subtitle="Indicateur approximatif — coût estimé à 75 % du prix gros. Pas une comptabilité officielle."
        badge="Estimation"
      />

      <ReportPeriodFilter
        {...periodState}
        onPeriodChange={periodState.setPeriod}
        onReferenceDateChange={periodState.setReferenceDate}
        onCustomEndDateChange={periodState.setCustomEndDate}
        periodLabel={periodState.periodLabel}
        onPrint={() => window.print()}
        resultCount={rows.length}
      />

      <div className="report-print-area">
        <ReportPrintHeader
          title="Estimation des bénéfices"
          periodLabel={periodState.periodLabel}
          subtitle={`Bénéfice estimé : ${formatMoney(totalProfit)} (coût ≈ 75 % du prix gros)`}
        />

        <div className="alert alert-warning report-estimate-banner no-print mb-3">
          <i className="bi bi-info-circle me-2" />
          Ces chiffres sont une <strong>estimation</strong>. Le coût d’achat réel
          n’est pas encore saisi produit par produit.
        </div>

        <div className="stat-grid mb-4 report-print-stats">
          <div className="stat-card stat-card-ice">
            <div className="stat-label">Chiffre d&apos;affaires</div>
            <div className="stat-value stat-value-sm">{formatMoney(totalSales)}</div>
          </div>
          <div className="stat-card stat-card-amber">
            <div className="stat-label">Coût estimé (≈75 % gros)</div>
            <div className="stat-value stat-value-sm">{formatMoney(totalCost)}</div>
          </div>
          <div className="stat-card stat-card-green">
            <div className="stat-label">Bénéfice estimé</div>
            <div className="stat-value stat-value-sm">{formatMoney(totalProfit)}</div>
          </div>
          <div className="stat-card stat-card-purple">
            <div className="stat-label">Marge estimée</div>
            <div className="stat-value">
              {totalSales ? Math.round((totalProfit / totalSales) * 100) : 0}%
            </div>
          </div>
        </div>

        <ReportAdvice items={advice} />

        <div className="panel">
          <h3 className="panel-title">Détail par vente</h3>
          {rows.length === 0 ? (
            <div className="empty-state">
              Aucune vente pour la période sélectionnée.
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Vente</th>
                  <th>CA</th>
                  <th>Coût</th>
                  <th>Bénéfice</th>
                  <th>Marge</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ sale, cost, profit, margin }) => (
                  <tr key={sale.id}>
                    <td>{sale.number}</td>
                    <td>{formatMoney(sale.total)}</td>
                    <td>{formatMoney(cost)}</td>
                    <td>{formatMoney(profit)}</td>
                    <td>{margin.toFixed(1)}%</td>
                    <td>{formatDate(sale.created_at)}</td>
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
