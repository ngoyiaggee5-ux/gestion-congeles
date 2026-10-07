import { useMemo, useState } from "react";
import { Form, Table } from "react-bootstrap";
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
import ReportAdvice from "../../components/ReportAdvice";
import { useApp } from "../../data/AppContext";
import { getSalesReportAdvice } from "../../utils/reportAdvice";
import { getChartTheme } from "../../utils/chartTheme";
import { filterByPeriod } from "../../utils/reportPeriod";
import { useReportPeriod } from "../../hooks/useReportPeriod";

export default function RapportVentes() {
  const { data, formatMoney, formatDate, getClientDisplayName } = useApp();
  const chart = getChartTheme(data.settings?.theme === "dark");
  const periodState = useReportPeriod();
  const [sellerFilter, setSellerFilter] = useState("");

  const periodSales = filterByPeriod(
    data.sales,
    "created_at",
    periodState.range
  );

  const sellers = useMemo(() => {
    const map = new Map();
    for (const sale of periodSales) {
      const key = sale.user_id != null ? String(sale.user_id) : "unknown";
      const name = sale.user_name || "Compte inconnu";
      if (!map.has(key)) map.set(key, name);
    }
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }, [periodSales]);

  const filteredSales = useMemo(() => {
    if (!sellerFilter) return periodSales;
    return periodSales.filter((sale) => String(sale.user_id ?? "unknown") === sellerFilter);
  }, [periodSales, sellerFilter]);

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

  const bySeller = useMemo(() => {
    const map = {};
    for (const sale of periodSales) {
      const name = sale.user_name || "Compte inconnu";
      map[name] = map[name] || { name, total: 0, count: 0 };
      map[name].total += sale.total;
      map[name].count += 1;
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [periodSales]);

  const totalPeriod = filteredSales.reduce((s, sale) => s + sale.total, 0);

  const advice = getSalesReportAdvice({
    filteredSales,
    byType,
    totalPeriod,
    formatMoney,
  });

  return (
    <>
      <PageHeader
        title="Rapport ventes"
        subtitle="Analyse des ventes détail et gros par période et par vendeur."
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

      <div className="panel no-print mb-3">
        <Form.Label className="small fw-semibold">Filtrer par vendeur</Form.Label>
        <Form.Select
          style={{ maxWidth: 320 }}
          value={sellerFilter}
          onChange={(e) => setSellerFilter(e.target.value)}
        >
          <option value="">Tous les vendeurs</option>
          {sellers.map((seller) => (
            <option key={seller.id} value={seller.id}>
              {seller.name}
            </option>
          ))}
        </Form.Select>
      </div>

      <div className="report-print-area">
        <ReportPrintHeader
          title="Rapport des ventes"
          periodLabel={periodState.periodLabel}
          subtitle={`Total période : ${formatMoney(totalPeriod)}${
            sellerFilter
              ? ` · ${sellers.find((s) => s.id === sellerFilter)?.name || ""}`
              : ""
          }`}
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

        <ReportAdvice items={advice} />

        <div className="panel mb-3">
          <h3 className="panel-title">Ventes par compte</h3>
          {bySeller.length === 0 ? (
            <div className="empty-state">Aucune vente sur la période.</div>
          ) : (
            <Table responsive hover size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>Vendeur</th>
                  <th>Tickets</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {bySeller.map((row) => (
                  <tr key={row.name}>
                    <td className="fw-semibold">{row.name}</td>
                    <td>{row.count}</td>
                    <td>{formatMoney(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
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
                  <th>Vendeur</th>
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
                    <td>{s.user_name || "—"}</td>
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
