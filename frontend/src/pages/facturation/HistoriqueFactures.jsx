import { useEffect, useRef, useState } from "react";
import { Alert, Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { useApp } from "../../data/AppContext";
import { PERMISSIONS } from "../../utils/permissions";
import { apiErrorMessage } from "../../utils/apiSync";

export default function HistoriqueFactures() {
  const {
    data,
    getClientDisplayName,
    formatMoney,
    formatDate,
    deleteInvoice,
    deleteAllInvoices,
    can,
    syncInvoicesFromApi,
    isApiMode,
  } = useApp();
  const { askConfirm, ConfirmDialog } = useConfirmDialog();
  const [loading, setLoading] = useState(false);
  const [purging, setPurging] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const initialLoadDone = useRef(false);
  const canDelete = can(PERMISSIONS.billingDelete);
  const canPrint = can(PERMISSIONS.billingPrint);
  const invoiceCount = data.invoices.length;

  useEffect(() => {
    if (!isApiMode || initialLoadDone.current) return;
    initialLoadDone.current = true;
    setLoading(true);
    syncInvoicesFromApi()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isApiMode, syncInvoicesFromApi]);

  const handleDeleteOne = (inv) => {
    setError("");
    setSuccess("");
    askConfirm({
      title: "Supprimer la facture",
      message: `Voulez-vous supprimer la facture ${inv.number} ?`,
      detail: "Cette action est irréversible.",
      confirmLabel: "Oui, supprimer",
      onConfirm: async () => {
        try {
          await deleteInvoice(inv.id);
          setSuccess(`Facture ${inv.number} supprimée.`);
        } catch (err) {
          setError(apiErrorMessage(err, "Impossible de supprimer cette facture."));
        }
      },
    });
  };

  const handleDeleteAll = () => {
    setError("");
    setSuccess("");
    askConfirm({
      title: "Supprimer tout l'historique",
      message: `Voulez-vous supprimer les ${invoiceCount} facture(s) de l'historique ?`,
      detail: "Cette action est définitive.",
      confirmLabel: "Oui, supprimer tout",
      onConfirm: async () => {
        setPurging(true);
        const countBefore = invoiceCount;
        try {
          const result = await deleteAllInvoices();
          setSuccess(
            result?.message ||
              `${result?.deleted ?? countBefore} facture(s) supprimée(s).`
          );
        } catch (err) {
          setError(apiErrorMessage(err, "Impossible de vider l'historique."));
        } finally {
          setPurging(false);
        }
      },
    });
  };

  return (
    <>
      <PageHeader
        title="Historique des factures"
        subtitle="Toutes les factures émises."
        actions={
          canDelete && invoiceCount > 0 ? (
            <Button variant="outline-danger" disabled={purging} onClick={handleDeleteAll}>
              <i className="bi bi-trash3 me-2" />
              {purging ? "Suppression…" : "Supprimer tout l'historique"}
            </Button>
          ) : null
        }
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

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
                      disabled={purging}
                      onClick={() => handleDeleteOne(inv)}
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
                  {loading ? "Chargement des factures…" : "Aucune facture enregistrée."}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <ConfirmDialog />
    </>
  );
}
