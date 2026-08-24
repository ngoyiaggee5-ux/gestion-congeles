import { Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useApp } from "../../data/AppContext";
import { PERMISSIONS } from "../../utils/permissions";

export default function HistoriqueFactures() {
  const { data, getClientDisplayName, formatMoney, formatDate, deleteInvoice, can } =
    useApp();
  const canDelete = can(PERMISSIONS.billingDelete);
  const canPrint = can(PERMISSIONS.billingPrint);

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
                  {canPrint && (
                    <Button
                      as={Link}
                      size="sm"
                      variant="outline-success"
                      className={canDelete ? "me-2" : ""}
                      to={`/facturation/imprimer?id=${inv.id}`}
                    >
                      Voir / Imprimer
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => {
                        if (confirm(`Supprimer la facture ${inv.number} ?`)) {
                          deleteInvoice(inv.id);
                        }
                      }}
                    >
                      Supprimer
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {!data.invoices.length && (
              <tr>
                <td colSpan={6} className="empty-state">
                  Aucune facture enregistrée.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
