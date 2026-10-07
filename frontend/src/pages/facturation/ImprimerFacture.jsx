import { useMemo } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import QRCode from "react-qr-code";
import PageHeader from "../../components/PageHeader";
import Logo from "../../components/Logo";
import { useApp } from "../../data/AppContext";
import { buildInvoiceQrPayload } from "../../utils/invoiceQr";
import { resolveLineTotal, formatCartQuantity } from "../../utils/saleAmount";

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
  const qrPayload = invoice ? buildInvoiceQrPayload(invoice) : "";

  return (
    <>
      <PageHeader
        title="Imprimer facture"
        subtitle="Aperçu imprimable compact."
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
        <div className="panel invoice-ticket" id="invoice-print">
          <div className="invoice-ticket-head">
            <div className="invoice-ticket-brand">
              <Logo size={40} className="brand-logo-invoice" />
              <div>
                <h2>MBALA KWA SELEMANI</h2>
                <p>Facture</p>
              </div>
            </div>
            <div className="invoice-ticket-meta">
              <strong>{invoice.number}</strong>
              <span>{formatDate(invoice.created_at)}</span>
            </div>
          </div>

          <div className="invoice-ticket-client">
            <span>Client</span>
            <strong>{getClientDisplayName(invoice)}</strong>
            {client?.phone && <span>{client.phone}</span>}
          </div>

          <Table className="invoice-ticket-table mb-0">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Qté</th>
                <th>P.U.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {sale?.items.map((item, idx) => {
                const product = getProduct(item.product_id);
                return (
                  <tr key={idx}>
                    <td>{product?.name}</td>
                    <td>{formatCartQuantity(item.quantity, product?.unit)}</td>
                    <td>{formatMoney(item.unit_price)}</td>
                    <td>{formatMoney(resolveLineTotal(item))}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <div className="invoice-ticket-total">
            <strong>Total : {formatMoney(invoice.total)}</strong>
            {sale && (
              <span>
                {sale.payment_method} · {sale.type}
              </span>
            )}
          </div>

          <div className="invoice-qr-block invoice-qr-only">
            <div className="invoice-qr-box">
              <QRCode
                value={qrPayload}
                size={88}
                level="M"
                bgColor="#ffffff"
                fgColor={
                  getComputedStyle(document.documentElement)
                    .getPropertyValue("--vf-green")
                    .trim() || "#0b6e4f"
                }
                className="invoice-qr-code"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
