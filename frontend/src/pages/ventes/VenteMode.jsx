import { Button, Card, Col, Row, Badge } from "react-bootstrap";
import PageHeader from "../../components/PageHeader";
import { useApp } from "../../data/AppContext";
import { Link } from "react-router-dom";

export default function VenteMode({ mode }) {
  const { data, addToCart, formatMoney, getCategoryName } = useApp();
  const isGros = mode === "gros";

  return (
    <>
      <PageHeader
        title={isGros ? "Vente en gros" : "Vente au détail"}
        subtitle={
          isGros
            ? "Tarifs grossiste pour les clients professionnels."
            : "Caisse rapide pour la vente unitaire."
        }
        actions={
          <Button as={Link} to="/ventes/panier" className="btn-vf">
            Voir le panier
          </Button>
        }
      />
      <Row className="g-3">
        {data.products.map((p) => (
          <Col key={p.id} md={6} xl={4}>
            <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: 16 }}>
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
                <div className="fs-5 fw-bold mb-3" style={{ color: "var(--vf-green)" }}>
                  {formatMoney(isGros ? p.price_wholesale : p.price_retail)}
                </div>
                <Button
                  className="btn-vf w-100"
                  disabled={p.stock <= 0}
                  onClick={() => addToCart(p.id, 1, mode)}
                >
                  Ajouter au panier
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
