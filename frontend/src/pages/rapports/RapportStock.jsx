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
import { useApp } from "../../data/AppContext";

const COLORS = ["#0b6e4f", "#1a9bb8", "#d97706", "#64748b"];

export default function RapportStock() {
  const { data, getCategoryName, formatMoney, stockStatus } = useApp();
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

  return (
    <>
      <PageHeader
        title="Rapport stock"
        subtitle={`Valeur stock (coût gros) : ${formatMoney(valeur)}`}
      />
      <div className="panel mb-3">
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" outerRadius={100} label>
                {pie.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="panel">
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
                      {status}
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
