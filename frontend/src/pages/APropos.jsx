import { Col, Row } from "react-bootstrap";
import Logo from "../components/Logo";
import PageHeader from "../components/PageHeader";

export default function APropos() {
  return (
    <>
      <PageHeader
        title="À propos"
        subtitle="Informations sur MBALA KWA SELEMANI et conditions d’utilisation."
        badge="Application"
      />

      <Row className="g-3">
        <Col lg={5}>
          <div className="panel about-intro-panel h-100">
            <div className="about-brand">
              <Logo size={56} />
              <div>
                <h2 className="about-app-name">MBALA KWA SELEMANI</h2>
                <p className="about-app-tagline mb-0">Gestion de congelé</p>
              </div>
            </div>
            <p className="about-version text-muted small mb-2">
              Ventes · Stock · Facturation · Rapports
            </p>
            <p className="about-credit mb-0">
              <i className="bi bi-code-slash me-2" />
              Développé par <strong>Biso.corp</strong>
            </p>
          </div>
        </Col>

        <Col lg={7}>
          <div className="panel about-section">
            <h3 className="panel-title">
              <i className="bi bi-info-circle me-2" />
              À propos
            </h3>
            <p className="about-text mb-0">
              Notre application facilite la vente et la gestion des produits congelés.
              Elle permet de consulter les produits disponibles, effectuer des achats et
              assurer une gestion simple et efficace des ventes et des stocks.
            </p>
          </div>
        </Col>

        <Col xs={12}>
          <div className="panel about-section">
            <h3 className="panel-title">
              <i className="bi bi-file-text me-2" />
              Conditions d’utilisation
            </h3>
            <p className="about-text mb-0">
              En utilisant cette application, vous acceptez de respecter les présentes
              conditions. Les produits sont vendus selon leur disponibilité en stock.
              Les prix peuvent être modifiés et les produits doivent être conservés dans
              des conditions appropriées après l’achat.
            </p>
          </div>
        </Col>
      </Row>
    </>
  );
}
