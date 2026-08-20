import { useMemo } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import Logo from "../../components/Logo";
import { useApp } from "../../data/AppContext";

export default function ImprimerFacture() {
  const {
    data,
    getClient,
    getProduct,
    formatMoney,
    formatDate,
    getClientDisplayName,
  } = useApp();
  const [params, setParams] = useSearchParams();
  const id = Number(params.get("id")) || data.invoices[0]?.id;

  const invoice = useMemo(
    () => data.invoices.find((i) => i.id === id),
    [data.invoices, id]
  );
  const sale = data.sales.find((s) => s.id === invoice?.sale_id);
  const client = getClient(invoice?.client_id);
  const subtotal = invoice?.subtotal_ht ?? sale?.subtotal_ht ?? invoice?.total ?? 0;
  const tva = invoice?.tva_amount ?? sale?.tva_amount ?? 0;
  const tvaRate = invoice?.tva_rate ?? sale?.tva_rate ?? data.settings.tvaRate;

  return (
    <>
      <PageHeader
        title="Imprimer facture"
        subtitle="Aperçu imprimable de la facture sélectionnée."
        actions={
          <Button className="btn-vf no-print" onClick={() => window.print()}>
            <i className="bi bi-printer me-1" />
            Imprimer
          </Button>
        }
      />
      <div className="panel no-print mb-3">
        <Form.Select
          style={{ maxWidth: 360 }}
          value={id || ""}
          onChange={(e) => setParams({ id: e.target.value })}
        >
          {data.invoices.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.number} — {formatMoney(inv.total)}
            </option>
          ))}
        </Form.Select>
      </div>

      {invoice && (
        <div className="panel" id="invoice-print">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div className="d-flex align-items-center gap-3">
              <Logo size={72} className="brand-logo-invoice" />
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", color: "var(--vf-green)" }}>
                  MBALA KWA SELEMANI
                </h2>
                <div className="text-muted">Gestion congelé · Facture</div>
              </div>
            </div>
            <div className="text-end">
              <div className="fw-bold fs-5">{invoice.number}</div>
              <div>{formatDate(invoice.created_at)}</div>
              <div className="text-capitalize">{invoice.status}</div>
            </div>
          </div>

          <div className="mb-4">
            <strong>Client</strong>
            <div>{getClientDisplayName(invoice)}</div>
            {client && (
              <>
                <div>{client.phone}</div>
                <div>{client.address}</div>
              </>
            )}
          </div>

          <Table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Qté</th>
                <th>P.U. HT</th>
                <th>Total HT</th>
              </tr>
            </thead>
            <tbody>
              {sale?.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{getProduct(item.product_id)?.name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatMoney(item.unit_price)}</td>
                  <td>{formatMoney(item.quantity * item.unit_price)}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="text-end mt-3">
            <div>Sous-total HT : {formatMoney(subtotal)}</div>
            <div>
              TVA ({tvaRate}%) : {formatMoney(tva)}
            </div>
            <div className="fs-4 fw-bold mt-2">
              Total TTC : {formatMoney(invoice.total)}
            </div>
          </div>
          {sale && (
            <div className="text-end text-muted">
              Paiement : {sale.payment_method} · Vente {sale.type}
            </div>
          )}
        </div>
      )}
    </>
  );
}
