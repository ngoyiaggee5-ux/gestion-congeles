import { useEffect, useState } from "react";
import { Alert, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import VfButton from "../../components/VfButton";
import { useApp } from "../../data/AppContext";
import { PERMISSIONS } from "../../utils/permissions";
import {
  cartLineTotal,
  formatCartQuantity,
  quantityFromAmount,
  isWeightUnit,
  getCartLineDisplay,
  formatQtyInputValue,
} from "../../utils/saleAmount";

function cartKey(item) {
  return `${Number(item.product_id)}-${item.mode}`;
}

function commitQty(raw, maxStock, unit = "kg", mode = "détail") {
  if (mode === "gros") {
    const parsed = parseInt(String(raw).trim(), 10);
    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    return Math.min(parsed, maxStock);
  }
  const parsed = isWeightUnit(unit)
    ? parseFloat(String(raw).trim().replace(",", "."))
    : parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return isWeightUnit(unit) ? 0.001 : 1;
  }
  return Math.min(parsed, maxStock);
}

function qtyChanged(prev, next) {
  return Math.abs(Number(prev) - Number(next)) >= 0.0005;
}

export default function Panier() {
  const {
    data,
    getProduct,
    updateCartQty,
    updateCartAmount,
    removeFromCart,
    clearCart,
    formatMoney,
    can,
  } = useApp();

  const [editingQty, setEditingQty] = useState({});
  const [editingAmount, setEditingAmount] = useState({});
  const [lineErr, setLineErr] = useState("");
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
    setEditingAmount((prev) => {
      const next = {};
      for (const [key, value] of Object.entries(prev)) {
        if (validKeys.has(key)) next[key] = value;
      }
      return next;
    });
  }, [data.cart]);

  const resolveLine = (item, product, key) => {
    const base = getCartLineDisplay(item, product);

    if (item.mode === "détail" && key in editingAmount) {
      const parsed = Math.round(Number(editingAmount[key]) || 0);
      if (parsed > 0) {
        const quantity = quantityFromAmount(
          parsed,
          item.unit_price,
          product?.unit
        );
        return {
          ...base,
          quantity,
          amount: parsed,
          lineTotal: parsed,
          quantityInput: formatQtyInputValue(quantity, product?.unit, item.mode),
          amountInput: String(parsed),
          quantityLabel: formatCartQuantity(quantity, product?.unit),
        };
      }
    }

    if (key in editingQty) {
      const parsed = isWeightUnit(product?.unit)
        ? parseFloat(String(editingQty[key]).replace(",", "."))
        : parseInt(editingQty[key], 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        const quantity = Math.min(parsed, product?.stock || parsed);
        const amount = Math.round(quantity * item.unit_price);
        return {
          ...base,
          quantity,
          amount,
          lineTotal: amount,
          soldByAmount: false,
          quantityInput: editingQty[key],
          amountInput: String(amount),
          quantityLabel: formatCartQuantity(quantity, product?.unit),
        };
      }
    }

    if (key in editingQty) {
      return { ...base, quantityInput: editingQty[key] };
    }
    if (key in editingAmount) {
      return { ...base, amountInput: editingAmount[key] };
    }

    return base;
  };

  const commitItemQty = (item, product) => {
    const key = cartKey(item);
    const base = getCartLineDisplay(item, product);
    const raw = key in editingQty ? editingQty[key] : base.quantityInput;
    const qty = commitQty(raw, product?.stock || 1, product?.unit, item.mode);
    if (qty <= 0) return;

    if (base.soldByAmount && !qtyChanged(base.quantity, qty)) {
      setEditingQty((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }

    updateCartQty(item.product_id, item.mode, qty);
    setEditingQty((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setEditingAmount((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const commitItemAmount = (item, product) => {
    const key = cartKey(item);
    const base = getCartLineDisplay(item, product);
    const raw = key in editingAmount ? editingAmount[key] : base.amountInput;
    setLineErr("");

    const parsed = Math.round(Number(raw) || 0);
    if (base.soldByAmount && parsed === base.amount) {
      setEditingAmount((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }

    const result = updateCartAmount(item.product_id, item.mode, raw);
    if (!result.ok) {
      setLineErr(result.error);
      return;
    }
    setEditingAmount((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setEditingQty((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const total = data.cart.reduce((sum, item) => {
    const product = getProduct(item.product_id);
    const line = resolveLine(item, product, cartKey(item));
    return sum + line.lineTotal;
  }, 0);

  return (
    <div className={`panier-shell${data.cart.length ? " has-checkout-bar" : ""}`}>
      <PageHeader
        title="Panier"
        subtitle="Révisez les lignes avant paiement — montants modifiables en détail."
        badge={`${data.cart.length} article${data.cart.length !== 1 ? "s" : ""}`}
        actions={
          canClear && (
            <VfButton
              variant="danger"
              disabled={!data.cart.length}
              onClick={clearCart}
              icon="bi-trash3"
            >
              Vider
            </VfButton>
          )
        }
      />

      <div className="panel panier-panel">
        {lineErr && (
          <Alert variant="danger" dismissible onClose={() => setLineErr("")}>
            {lineErr}
          </Alert>
        )}

        {!data.cart.length ? (
          <div className="empty-state-modern">
            <i className="bi bi-basket" />
            <h3>Panier vide</h3>
            <p>Ajoutez des produits depuis la caisse détail ou le mode gros.</p>
            <VfButton as={Link} to="/ventes/detail" icon="bi-cart-plus">
              Ouvrir la caisse
            </VfButton>
          </div>
        ) : (
          <div className="cart-lines">
            {data.cart.map((item) => {
              const product = getProduct(item.product_id);
              const key = cartKey(item);
              const isDetail = item.mode === "détail";
              const line = resolveLine(item, product, key);

              return (
                <article key={key} className="cart-line-card">
                  <div className="cart-line-head">
                    <div>
                      <h3>{product?.name}</h3>
                      <p>
                        {line.quantityLabel}
                        {line.soldByAmount && (
                          <span className="cart-line-tag">· vendu au montant</span>
                        )}
                      </p>
                    </div>
                    <div className="cart-line-total">{formatMoney(line.lineTotal)}</div>
                  </div>

                  <div className="cart-line-meta">
                    <span className="text-capitalize">{item.mode}</span>
                    <span>{formatMoney(item.unit_price)} / unité</span>
                  </div>

                  <div className="cart-line-controls">
                    <Form.Group>
                      <Form.Label>Quantité</Form.Label>
                      <Form.Control
                        type="number"
                        min={isDetail && isWeightUnit(product?.unit) ? "0.001" : "1"}
                        step={isDetail && isWeightUnit(product?.unit) ? "0.001" : "1"}
                        max={product?.stock || 1}
                        value={line.quantityInput}
                        onChange={(e) =>
                          setEditingQty((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        onBlur={() => commitItemQty(item, product)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }
                        }}
                      />
                    </Form.Group>

                    {isDetail && (
                      <Form.Group>
                        <Form.Label>Montant (CDF)</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          step="1"
                          value={line.amountInput}
                          onChange={(e) =>
                            setEditingAmount((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          onBlur={() => commitItemAmount(item, product)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              e.currentTarget.blur();
                            }
                          }}
                        />
                      </Form.Group>
                    )}

                    <VfButton
                      variant="danger"
                      size="sm"
                      className="cart-line-remove"
                      onClick={() => removeFromCart(item.product_id, item.mode)}
                      icon="bi-x-lg"
                    >
                      Retirer
                    </VfButton>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {data.cart.length > 0 && (
        <div className="checkout-bar no-print">
          <div>
            <div className="checkout-bar-label">Total à encaisser</div>
            <div className="checkout-bar-total">{formatMoney(total)}</div>
          </div>
          {canPay && (
            <VfButton as={Link} to="/ventes/paiement" icon="bi-credit-card-2-front">
              Aller au paiement
            </VfButton>
          )}
        </div>
      )}
    </div>
  );
}
