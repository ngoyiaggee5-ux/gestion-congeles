import { useMemo, useState } from "react";
import { Badge, Col, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import SmartSuggest from "../../components/SmartSuggest";
import CartDock from "../../components/CartDock";
import VfButton from "../../components/VfButton";
import { useToast } from "../../components/ToastStack";
import { useApp } from "../../data/AppContext";
import { getCategoryIcon } from "../../utils/categoryIcons";
import { cartLineTotal, formatCartQuantity, quantityFromAmount } from "../../utils/saleAmount";

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

  const pickProduct = (item) => {
    const product = data.products.find((p) => p.id === item.id);
    if (!product || product.stock <= 0) return;

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
            ? "Sélection rapide — produits populaires et stock disponible en priorité."
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
          const qtyPreview = previewAmount(p, cardAmount);
          const categoryName = getCategoryName(p.category_id);

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
                {canSellByAmount && cardAmount.trim()
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
