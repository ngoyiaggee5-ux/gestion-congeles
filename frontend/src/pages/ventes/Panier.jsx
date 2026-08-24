import { useEffect, useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useApp } from "../../data/AppContext";
import { PERMISSIONS } from "../../utils/permissions";

function cartKey(item) {
  return `${item.product_id}-${item.mode}`;
}

function commitQty(raw, maxStock) {
  const parsed = parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.min(parsed, maxStock);
}

export default function Panier() {
  const {
    data,
    getProduct,
    updateCartQty,
    removeFromCart,
    clearCart,
    formatMoney,
    can,
  } = useApp();

  const [editingQty, setEditingQty] = useState({});
  const canClear = can(PERMISSIONS.cartClear);
  const canPay = can(PERMISSIONS.salesPayment);

  useEffect(() => {
    const validKeys = new Set(data.cart.map(cartKey));
    setEditingQty((prev) => {
      const next = {};
      for (const [key, value] of Object.entries(prev)) {
        if (validKeys.has(key)) next[key] = value;
      }
      return next;
    });
  }, [data.cart]);

  const commitItemQty = (item, product) => {
    const key = cartKey(item);
    const raw = key in editingQty ? editingQty[key] : String(item.quantity);
    const qty = commitQty(raw, product?.stock || 1);
    updateCartQty(item.product_id, item.mode, qty);
    setEditingQty((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const displayQty = (item) => {
    const key = cartKey(item);
    return key in editingQty ? editingQty[key] : String(item.quantity);
  };

  const total = data.cart.reduce((s, i) => {
    const key = cartKey(i);
    if (key in editingQty) {
      const parsed = parseInt(editingQty[key], 10);
      const qty =
        editingQty[key] !== "" && Number.isFinite(parsed) && parsed > 0
          ? parsed
          : i.quantity;
      return s + qty * i.unit_price;
    }
    return s + i.quantity * i.unit_price;
  }, 0);

  return (
    <>
      <PageHeader
        title="Panier"
        subtitle="Articles en attente de paiement."
        actions={
          <>
            {canClear && (
              <Button
                variant="outline-danger"
                disabled={!data.cart.length}
                onClick={clearCart}
              >
                Vider
              </Button>
            )}
            {canPay && (
              <Button
                as={Link}
                to="/ventes/paiement"
                className="btn-vf"
                disabled={!data.cart.length}
              >
                Paiement
              </Button>
            )}
          </>
        }
      />
      <div className="panel">
        {!data.cart.length ? (
          <div className="empty-state">
            Panier vide. Ajoutez des produits depuis Vente au détail ou en gros.
          </div>
        ) : (
          <Table responsive hover>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Mode</th>
                <th>Prix</th>
                <th>Qté</th>
                <th>Sous-total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.cart.map((item) => {
                const product = getProduct(item.product_id);
                const key = cartKey(item);
                const shownQty = displayQty(item);
                const parsedShown = parseInt(shownQty, 10);
                const lineQty =
                  shownQty !== "" && Number.isFinite(parsedShown) && parsedShown > 0
                    ? Math.min(parsedShown, product?.stock || parsedShown)
                    : item.quantity;

                return (
                  <tr key={key}>
                    <td className="fw-semibold">{product?.name}</td>
                    <td className="text-capitalize">{item.mode}</td>
                    <td>{formatMoney(item.unit_price)}</td>
                    <td style={{ maxWidth: 100 }}>
                      <Form.Control
                        type="number"
                        min="1"
                        max={product?.stock || 1}
                        value={shownQty}
                        onChange={(e) =>
                          setEditingQty((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        onBlur={() => commitItemQty(item, product)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }
                        }}
                        aria-label={`Quantité ${product?.name}`}
                      />
                    </td>
                    <td>{formatMoney(lineQty * item.unit_price)}</td>
                    <td className="text-end">
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() =>
                          removeFromCart(item.product_id, item.mode)
                        }
                      >
                        Retirer
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
        <div className="d-flex justify-content-end mt-3">
          <div className="fs-4 fw-bold" style={{ fontFamily: "var(--font-display)" }}>
            Total : {formatMoney(total)}
          </div>
        </div>
      </div>
    </>
  );
}
