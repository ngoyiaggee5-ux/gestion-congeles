import { Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useApp } from "../../data/AppContext";

export default function HistoriqueFactures() {
  const { data, getClientDisplayName, formatMoney, formatDate } = useApp();

  return (
    <>
      <PageHeader
        title="Historique des factures"
        subtitle="Toutes les factures émises."
      />
      <div className="panel">
        <Table responsive hover>
          <thead>
            <tr>
              <th>N° facture</th>
              <th>Client</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="fw-semibold">{inv.number}</td>
                <td>{getClientDisplayName(inv)}</td>
                <td>{formatMoney(inv.total)}</td>
                <td className="text-capitalize">{inv.status}</td>
                <td>{formatDate(inv.created_at)}</td>
                <td className="text-end">
                  <Button
                    as={Link}
                    size="sm"
                    variant="outline-success"
                    to={`/facturation/imprimer?id=${inv.id}`}
                  >
                    Voir / Imprimer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}
