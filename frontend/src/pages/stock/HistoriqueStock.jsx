import { Table } from "react-bootstrap";
import PageHeader from "../../components/PageHeader";
import { useApp } from "../../data/AppContext";

export default function HistoriqueStock() {
  const { data, getProduct, formatDate, formatMoney } = useApp();

  return (
    <>
      <PageHeader
        title="Historique stock"
        subtitle="Journal des entrées et sorties."
      />
      <div className="panel">
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
            {data.stockMovements.map((m) => {
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
      </div>
    </>
  );
}
