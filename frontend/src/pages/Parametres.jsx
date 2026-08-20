import { useEffect, useState } from "react";
import { Alert, Button, Col, Form, Nav, Row, Tab } from "react-bootstrap";
import PageHeader from "../components/PageHeader";
import { useApp } from "../data/AppContext";
import { applyAppearance, formatMoney as formatMoneyUtil } from "../utils/settings";

export default function Parametres() {
  const { data, updateSettings } = useApp();
  const [settings, setSettings] = useState(data.settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(data.settings);
  }, [data.settings]);

  useEffect(() => {
    applyAppearance(settings);
  }, [settings]);

  const onChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const save = () => {
    updateSettings({
      font: settings.font,
      theme: settings.theme,
      tvaRate: Number(settings.tvaRate),
      currency: settings.currency,
      usdRate: Number(settings.usdRate),
    });
    applyAppearance(settings);
    setSaved(true);
  };

  return (
    <>
      <PageHeader
        title="Paramètres"
        subtitle="Personnalisez l’apparence, la TVA et la devise."
        actions={
          <Button className="btn-vf" onClick={save}>
            Enregistrer
          </Button>
        }
      />

      {saved && <Alert variant="success">Paramètres enregistrés.</Alert>}

      <div className="panel">
        <Tab.Container defaultActiveKey="police">
          <Nav variant="tabs" className="mb-4">
            <Nav.Item>
              <Nav.Link eventKey="police">
                <i className="bi bi-fonts me-1" />
                Police
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="theme">
                <i className="bi bi-moon-stars me-1" />
                Thème
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="tva">
                <i className="bi bi-percent me-1" />
                TVA
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="devise">
                <i className="bi bi-currency-exchange me-1" />
                Devise
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="police">
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Police de l’interface</Form.Label>
                    <Form.Select
                      value={settings.font}
                      onChange={(e) => onChange("font", e.target.value)}
                    >
                      <option value="dm-sans">DM Sans (moderne)</option>
                      <option value="outfit">Outfit (compacte)</option>
                      <option value="system">Système (neutre)</option>
                      <option value="serif">Serif (classique)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <div className="settings-preview">
                    <div className="settings-preview-title">Aperçu</div>
                    <h4>MBALA KWA SELEMANI</h4>
                    <p>Gestion de congelé — ventes, stock et facturation.</p>
                  </div>
                </Col>
              </Row>
            </Tab.Pane>

            <Tab.Pane eventKey="theme">
              <Row className="g-3">
                {[
                  { id: "light", label: "Clair", icon: "bi-sun" },
                  { id: "dark", label: "Sombre", icon: "bi-moon" },
                ].map((theme) => (
                  <Col md={6} key={theme.id}>
                    <button
                      type="button"
                      className={`theme-choice ${settings.theme === theme.id ? "active" : ""}`}
                      onClick={() => onChange("theme", theme.id)}
                    >
                      <i className={`bi ${theme.icon} me-2`} />
                      Thème {theme.label}
                    </button>
                  </Col>
                ))}
              </Row>
            </Tab.Pane>

            <Tab.Pane eventKey="tva">
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Taux de TVA (%)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={settings.tvaRate}
                      onChange={(e) => onChange("tvaRate", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <div className="settings-preview">
                    <div className="settings-preview-title">Exemple sur 10 000 FC</div>
                    <div>HT : {formatMoneyUtil(10000, settings)}</div>
                    <div>
                      TVA ({settings.tvaRate}%) :{" "}
                      {formatMoneyUtil(
                        10000 * (Number(settings.tvaRate) / 100),
                        settings
                      )}
                    </div>
                    <div className="fw-bold">
                      TTC :{" "}
                      {formatMoneyUtil(
                        10000 * (1 + Number(settings.tvaRate) / 100),
                        settings
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </Tab.Pane>

            <Tab.Pane eventKey="devise">
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Devise d’affichage</Form.Label>
                    <Form.Select
                      value={settings.currency}
                      onChange={(e) => onChange("currency", e.target.value)}
                    >
                      <option value="CDF">CDF — Franc congolais</option>
                      <option value="USD">USD — Dollar américain</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Taux de change (1 USD = … CDF)</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={settings.usdRate}
                      onChange={(e) => onChange("usdRate", e.target.value)}
                      disabled={settings.currency !== "USD"}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <div className="settings-preview">
                    <div className="settings-preview-title">Conversion</div>
                    <div>28 000 FC → {formatMoneyUtil(28000, settings)}</div>
                    <div className="text-muted small mt-1">
                      Les prix sont stockés en CDF. L’USD est calculé via le
                      taux.
                    </div>
                  </div>
                </Col>
              </Row>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    </>
  );
}
