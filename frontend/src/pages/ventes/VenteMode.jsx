import { useMemo, useState } from "react";
import { Button, Card, Col, Row, Badge } from "react-bootstrap";
import PageHeader from "../../components/PageHeader";
import SmartSuggest from "../../components/SmartSuggest";
import { useApp } from "../../data/AppContext";
import { Link } from "react-router-dom";

export default function VenteMode({ mode }) {
  const { data, addToCart, formatMoney, getCategoryName, suggestProducts } =
    useApp();
  const [query, setQuery] = useState("");
  const isGros = mode === "gros";

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

  const pickProduct = (item) => {
    const product = data.products.find((p) => p.id === item.id);
    if (product?.stock > 0) {
      addToCart(product.id, 1, mode);
      setQuery("");
    }
  };

  return (
    <>
      <PageHeader
        title={isGros ? "Vente en gros" : "Vente au détail"}
        subtitle={
          isGros
            ? "Recherche intelligente — produits populaires et disponibles en priorité."
            : "Caisse rapide avec suggestions produits."
        }
        actions={
          <Button as={Link} to="/ventes/panier" className="btn-vf btn-modern">
            Voir le panier
          </Button>
        }
      />

      <div className="panel mb-4">
        <SmartSuggest
          label="Rechercher un produit"
          value={query}
          onChange={setQuery}
          onSelect={pickProduct}
          suggestions={suggestions}
          placeholder="Nom, SKU ou catégorie…"
          emptyText="Aucun produit correspondant"
        />
      </div>

      <Row className="g-3">
        {visibleProducts.map((p) => (
          <Col key={p.id} md={6} xl={4}>
            <Card className="h-100 product-card border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="text-muted small">{p.sku}</div>
                    <h5 className="mb-1" style={{ fontFamily: "var(--font-display)" }}>
                      {p.name}
                    </h5>
                    <div className="small text-muted">
                      {getCategoryName(p.category_id)}
                    </div>
                  </div>
                  <Badge bg={p.stock > 0 ? "success" : "danger"}>
                    {p.stock} {p.unit}
                  </Badge>
                </div>
                <div className="fs-5 fw-bold mb-3 product-price">
                  {formatMoney(isGros ? p.price_wholesale : p.price_retail)}
                </div>
                <Button
                  className="btn-vf btn-modern w-100"
                  disabled={p.stock <= 0}
                  onClick={() => addToCart(p.id, 1, mode)}
                >
                  Ajouter au panier
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
        {!visibleProducts.length && (
          <Col xs={12}>
            <div className="empty-state">Aucun produit trouvé pour cette recherche.</div>
          </Col>
        )}
      </Row>
    </>
  );
}
