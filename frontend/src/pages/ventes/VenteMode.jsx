import { useMemo, useState } from "react";
import { Badge, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import SmartSuggest from "../../components/SmartSuggest";
import CartDock from "../../components/CartDock";
import VfButton from "../../components/VfButton";
import { useToast } from "../../components/ToastStack";
import { useApp } from "../../data/AppContext";
import { getCategoryIcon } from "../../utils/categoryIcons";
import {
  cartLineTotal,
  formatCartQuantity,
  quantityFromAmount,
  isWeightUnit,
} from "../../utils/saleAmount";

function parseSellQty(raw, unit, maxStock) {
  const parsed = isWeightUnit(unit)
    ? parseFloat(String(raw).trim().replace(",", "."))
    : parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  const qty = isWeightUnit(unit)
    ? Math.round(parsed * 1000) / 1000
    : Math.round(parsed);
  return Math.min(qty, maxStock);
}

export default function VenteMode({ mode }) {
  const {
    data,
    addToCart,
    addToCartByAmount,
    formatMoney,
    getCategoryName,
    suggestProducts,
    stockStatus,
  } = useApp();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [quickAmount, setQuickAmount] = useState("");
  const [amountByProduct, setAmountByProduct] = useState({});
  const [qtyByProduct, setQtyByProduct] = useState({});
  const isGros = mode === "gros";
  const canSellByAmount = !isGros;

  const suggestions = useMemo(
    () =>
      suggestProducts(query, mode).map((item) => ({
        ...item,
        price: formatMoney(item.price),
      })),
    [suggestProducts, query, mode, formatMoney]
  );

  const visibleProducts = useMemo(() => {
    if (!query.trim()) return data.products;
    return suggestProducts(query, mode)
      .map((item) => data.products.find((p) => p.id === item.id))
      .filter(Boolean);
  }, [data.products, query, mode, suggestProducts]);

  const cartLines = data.cart.length;
  const cartTotal = data.cart.reduce((sum, item) => sum + cartLineTotal(item), 0);

  const sellByAmount = (product, amountRaw) => {
    const result = addToCartByAmount(product.id, amountRaw, mode);
    if (!result.ok) {
      toast(result.error, "danger");
      return;
    }
    toast(
      `${product.name} · ${formatMoney(result.saleAmount)} → ${formatCartQuantity(result.quantity, product.unit)}`
    );
    setAmountByProduct((prev) => ({ ...prev, [product.id]: "" }));
    if (quickAmount && !query.trim()) setQuickAmount("");
  };

  const sellByQty = (product, qtyRaw) => {
    const qty = parseSellQty(qtyRaw, product.unit, product.stock);
    if (!qty) {
      toast(
        isWeightUnit(product.unit)
          ? "Indiquez un nombre de kilos valide."
          : "Indiquez une quantité valide.",
        "danger"
      );
      return;
    }
    if (qty > product.stock) {
      toast(`Stock insuffisant (${product.stock} ${product.unit}).`, "danger");
      return;
    }
    addToCart(product.id, qty, mode);
    toast(`${product.name} · ${formatCartQuantity(qty, product.unit)} ajouté`);
    setQtyByProduct((prev) => ({ ...prev, [product.id]: "" }));
  };

  const pickProduct = (item) => {
    const product = data.products.find((p) => p.id === item.id);
    if (!product || product.stock <= 0) return;

    if (isGros) {
      const qtyRaw = qtyByProduct[product.id] || (isWeightUnit(product.unit) ? "" : "1");
      if (qtyRaw) {
        sellByQty(product, qtyRaw);
      } else {
        toast(
          isWeightUnit(product.unit)
            ? "Saisissez le nombre de kilos puis validez."
            : "Saisissez la quantité puis validez.",
          "warning"
        );
      }
      setQuery("");
      return;
    }

    const amount = quickAmount.trim();
    if (canSellByAmount && amount) {
      sellByAmount(product, amount);
      setQuery("");
      return;
    }

    addToCart(product.id, 1, mode);
    toast(`${product.name} ajouté au panier`);
    setQuery("");
  };

  const previewAmount = (product, amountRaw) => {
    const price = isGros ? product.price_wholesale : product.price_retail;
    const qty = quantityFromAmount(amountRaw, price, product.unit);
    if (!qty) return null;
    return formatCartQuantity(qty, product.unit);
  };

  const addProduct = (product, cardAmount) => {
    if (isGros) {
      const raw = qtyByProduct[product.id];
      if (raw?.trim()) {
        sellByQty(product, raw);
        return;
      }
      if (!isWeightUnit(product.unit)) {
        sellByQty(product, "1");
        return;
      }
      toast("Saisissez le nombre de kilos.", "warning");
      return;
    }

    if (canSellByAmount && cardAmount.trim()) {
      sellByAmount(product, cardAmount);
      return;
    }
    addToCart(product.id, 1, mode);
    toast(`${product.name} ajouté au panier`);
  };

  return (
    <div className="vente-shell has-cart-dock">
      <PageHeader
        title={isGros ? "Vente en gros" : "Caisse détail"}
        subtitle={
          isGros
            ? "Saisissez les kilos (ou la quantité) puis ajoutez au panier."
            : "Tapez, choisissez, encaissez. Vente par quantité ou montant client."
        }
        badge={isGros ? "Gros" : "Caisse"}
        actions={
          <VfButton as={Link} to="/ventes/panier" variant="outline" icon="bi-basket">
            Panier {cartLines > 0 ? `(${cartLines})` : ""}
          </VfButton>
        }
      />

      <div className="panel vente-search-panel sticky-search">
        <SmartSuggest
          label="Rechercher un produit"
          value={query}
          onChange={setQuery}
          onSelect={pickProduct}
          suggestions={suggestions}
          placeholder="Nom, SKU ou catégorie…"
          emptyText="Aucun produit correspondant"
        />
        {canSellByAmount && (
          <div className="sale-quick-amount mt-3">
            <Form.Label className="small fw-semibold mb-1">
              Montant client (optionnel)
            </Form.Label>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <Form.Control
                type="number"
                min="1"
                step="100"
                className="sale-amount-input"
                placeholder="Ex. 5000 CDF"
                value={quickAmount}
                onChange={(e) => setQuickAmount(e.target.value)}
              />
              <span className="small text-muted">
                Saisissez un montant puis choisissez le produit.
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="product-grid-modern">
        {visibleProducts.map((p) => {
          const status = stockStatus(p);
          const unitPrice = isGros ? p.price_wholesale : p.price_retail;
          const cardAmount = amountByProduct[p.id] ?? "";
          const cardQty = qtyByProduct[p.id] ?? "";
          const qtyPreview = previewAmount(p, cardAmount);
          const categoryName = getCategoryName(p.category_id);
          const weight = isWeightUnit(p.unit);

          return (
            <article
              key={p.id}
              className={`product-tile ${status !== "ok" ? "product-tile-alert" : ""}`}
            >
              <div className="product-tile-top">
                <div className="product-tile-icon">
                  <i className={`bi ${getCategoryIcon(categoryName)}`} />
                </div>
                <Badge
                  bg={status === "out" ? "danger" : status === "low" ? "warning" : "success"}
                  className="product-tile-stock"
                >
                  {p.stock} {p.unit}
                </Badge>
              </div>

              <div className="product-tile-body">
                <span className="product-tile-sku">{p.sku}</span>
                <h3>{p.name}</h3>
                <p>{categoryName}</p>
                <div className="product-tile-price">
                  {formatMoney(unitPrice)}
                  <span> / {p.unit}</span>
                </div>
              </div>

              {status !== "ok" && (
                <div className="product-stock-warning">
                  <i className="bi bi-exclamation-triangle-fill me-1" />
                  {status === "out" ? "Rupture de stock" : "Stock sous le seuil minimum"}
                </div>
              )}

              {isGros && (
                <div className="sale-by-amount-block">
                  <Form.Label className="small fw-semibold mb-1">
                    {weight ? "Kilos" : "Quantité"} ({p.unit})
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min={weight ? "0.001" : "1"}
                    step={weight ? "0.001" : "1"}
                    placeholder={weight ? "Ex. 12.5" : "Ex. 10"}
                    value={cardQty}
                    disabled={p.stock <= 0}
                    onChange={(e) =>
                      setQtyByProduct((prev) => ({
                        ...prev,
                        [p.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && cardQty) {
                        e.preventDefault();
                        sellByQty(p, cardQty);
                      }
                    }}
                    aria-label={`${weight ? "Kilos" : "Quantité"} pour ${p.name}`}
                  />
                  {cardQty && parseSellQty(cardQty, p.unit, p.stock) > 0 && (
                    <div className="small text-muted mt-1">
                      ≈{" "}
                      {formatMoney(
                        Math.round(parseSellQty(cardQty, p.unit, p.stock) * unitPrice)
                      )}
                    </div>
                  )}
                </div>
              )}

              {canSellByAmount && (
                <div className="sale-by-amount-block">
                  <Form.Label className="small fw-semibold mb-1">
                    Montant (CDF)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Ex. 5000"
                    value={cardAmount}
                    disabled={p.stock <= 0}
                    onChange={(e) =>
                      setAmountByProduct((prev) => ({
                        ...prev,
                        [p.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && cardAmount) {
                        e.preventDefault();
                        sellByAmount(p, cardAmount);
                      }
                    }}
                    aria-label={`Montant pour ${p.name}`}
                  />
                  {qtyPreview && (
                    <div className="small text-muted mt-1">
                      ≈ {qtyPreview} pour {formatMoney(Number(cardAmount) || 0)}
                    </div>
                  )}
                </div>
              )}

              <VfButton
                className="w-100 product-tile-action"
                disabled={p.stock <= 0}
                onClick={() => addProduct(p, cardAmount)}
                icon="bi-plus-circle"
              >
                {isGros && cardQty.trim()
                  ? `Ajouter ${formatCartQuantity(
                      parseSellQty(cardQty, p.unit, p.stock) || 0,
                      p.unit
                    )}`
                  : canSellByAmount && cardAmount.trim()
                    ? `Vendre ${formatMoney(Number(cardAmount))}`
                    : "Ajouter au panier"}
              </VfButton>
            </article>
          );
        })}
      </div>

      {!visibleProducts.length && (
        <div className="empty-state-modern">
          <i className="bi bi-search" />
          <h3>Aucun produit trouvé</h3>
          <p>Essayez un autre mot-clé ou vérifiez le stock disponible.</p>
        </div>
      )}

      <CartDock count={cartLines} total={cartTotal} formatMoney={formatMoney} />
    </div>
  );
}
