import { Table } from "react-bootstrap";
import PageHeader from "../../components/PageHeader";
import { useApp } from "../../data/AppContext";

export default function RapportBenefices() {
  const { data, formatMoney, getProduct, formatDate } = useApp();

  const rows = data.sales.map((sale) => {
    const cost = sale.items.reduce((sum, item) => {
      const product = getProduct(item.product_id);
      const unitCost = product ? product.price_wholesale * 0.75 : 0;
      return sum + unitCost * item.quantity;
    }, 0);
    const profit = sale.total - cost;
    return { sale, cost, profit, margin: sale.total ? (profit / sale.total) * 100 : 0 };
  });

  const totalSales = rows.reduce((s, r) => s + r.sale.total, 0);
  const totalCost = rows.reduce((s, r) => s + r.cost, 0);
  const totalProfit = totalSales - totalCost;

  return (
    <>
      <PageHeader
        title="Rapport bénéfices"
        subtitle="Estimation des marges sur les ventes enregistrées."
      />
      <div className="stat-grid mb-4">
        <div className="stat-card">
          <div className="stat-label">Chiffre d’affaires</div>
          <div className="stat-value" style={{ fontSize: "1.2rem" }}>
            {formatMoney(totalSales)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Coût estimé</div>
          <div className="stat-value" style={{ fontSize: "1.2rem" }}>
            {formatMoney(totalCost)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Bénéfice</div>
          <div className="stat-value" style={{ fontSize: "1.2rem" }}>
            {formatMoney(totalProfit)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Marge moyenne</div>
          <div className="stat-value">
            {totalSales ? Math.round((totalProfit / totalSales) * 100) : 0}%
          </div>
        </div>
      </div>
      <div className="panel">
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
      </div>
    </>
  );
}
