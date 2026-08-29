import { useState } from "react";
import { Alert, Button, Form, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { useApp } from "../../data/AppContext";
import { PERMISSIONS } from "../../utils/permissions";

export default function GenererFacture() {
  const {
    data,
    createInvoiceFromSale,
    formatMoney,
    formatDate,
    getClientDisplayName,
    deleteSale,
    can,
  } = useApp();
  const { askConfirm, ConfirmDialog } = useConfirmDialog();
  const canDeleteSale = can(PERMISSIONS.salesDelete);
  const [saleId, setSaleId] = useState("");
  const [msg, setMsg] = useState("");

  const salesWithoutInvoice = data.sales.filter(
    (s) => !data.invoices.some((i) => i.sale_id === s.id)
  );

  const generate = (e) => {
    e.preventDefault();
    createInvoiceFromSale(Number(saleId));
    setMsg("Facture générée.");
    setSaleId("");
  };

  return (
    <>
      <PageHeader
        title="Générer facture"
        subtitle="Créer une facture à partir d’une vente existante."
      />
      <div className="panel mb-3" style={{ maxWidth: 640 }}>
        {msg && <Alert variant="success">{msg}</Alert>}
        <Form onSubmit={generate}>
          <Form.Group className="mb-3">
            <Form.Label>Vente sans facture</Form.Label>
            <Form.Select
              value={saleId}
              onChange={(e) => setSaleId(e.target.value)}
              required
            >
              <option value="">Choisir…</option>
              {salesWithoutInvoice.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.number} — {formatMoney(s.total)} — {formatDate(s.created_at)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Button type="submit" className="btn-vf" disabled={!salesWithoutInvoice.length}>
            Générer
          </Button>
        </Form>
      </div>
      <div className="panel">
        <h3 className="panel-title">Dernières ventes</h3>
        <Table responsive hover>
          <thead>
            <tr>
              <th>N°</th>
              <th>Client</th>
              <th>Total</th>
              <th>Date</th>
              <th>Facture</th>
              {canDeleteSale && <th></th>}
            </tr>
          </thead>
          <tbody>
            {data.sales.map((s) => {
              const inv = data.invoices.find((i) => i.sale_id === s.id);
              return (
                <tr key={s.id}>
                  <td>{s.number}</td>
                  <td>{getClientDisplayName(s)}</td>
                  <td>{formatMoney(s.total)}</td>
                  <td>{formatDate(s.created_at)}</td>
                  <td>
                    {inv ? (
                      <Button
                        as={Link}
                        size="sm"
                        to={`/facturation/imprimer?id=${inv.id}`}
                        variant="outline-success"
                      >
                        {inv.number}
                      </Button>
                    ) : (
                      "—"
                    )}
                  </td>
                  {canDeleteSale && (
                    <td className="text-end">
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() =>
                          askConfirm({
                            title: "Supprimer la vente",
                            message: `Voulez-vous supprimer la vente ${s.number} ?`,
                            confirmLabel: "Oui, supprimer",
                            onConfirm: () => deleteSale(s.id),
                          })
                        }
                      >
                        Supprimer
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      <ConfirmDialog />
    </>
  );
}
