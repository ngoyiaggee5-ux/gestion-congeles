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
import { useApp } from "../../data/AppContext";

export default function RapportVentes() {
  const { data, formatMoney, formatDate, getClientDisplayName } = useApp();
  const byType = [
    {
      name: "Détail",
      total: data.sales
        .filter((s) => s.type === "détail")
        .reduce((a, s) => a + s.total, 0),
    },
    {
      name: "Gros",
      total: data.sales
        .filter((s) => s.type === "gros")
        .reduce((a, s) => a + s.total, 0),
    },
  ];

  return (
    <>
      <PageHeader title="Rapport ventes" subtitle="Analyse des ventes détail et gros." />
      <div className="panel mb-3">
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7e5de" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v) => formatMoney(v)} />
              <Bar dataKey="total" fill="#0b6e4f" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="panel">
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
            {data.sales.map((s) => (
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
      </div>
    </>
  );
}
