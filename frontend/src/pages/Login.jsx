import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Alert, Form } from "react-bootstrap";
import Logo from "../components/Logo";
import VfButton from "../components/VfButton";
import { useApp } from "../data/AppContext";
import { getDefaultHomeForRole } from "../utils/permissions";
import { checkApiHealth } from "../utils/api";
import { isApiMode } from "../utils/config";

export default function Login() {
  const { login, isAuthenticated, currentUser } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    if (!isApiMode) return;
    checkApiHealth().then(setApiOnline);
  }, []);

  if (isAuthenticated) {
    return <Navigate to={getDefaultHomeForRole(currentUser?.role)} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setWarning("");
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.ok) {
      if (result.warning) setWarning(result.warning);
      navigate(getDefaultHomeForRole(result.user?.role), { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <Logo size={88} className="login-logo" />
          <h1>MBALA KWA SELEMANI</h1>
          <p>Gestion de congelé — Connexion sécurisée</p>
        </div>

        {isApiMode && apiOnline === false && (
          <Alert variant="warning" className="small mb-3">
            API hors ligne — connexion en mode local possible. Lancez{" "}
            <strong>backend/demarrer-api.bat</strong> puis redémarrez le frontend.
          </Alert>
        )}
        {isApiMode && apiOnline === true && (
          <Alert variant="success" className="small mb-3 py-2">
            API connectée — si la connexion échoue, double-cliquez{" "}
            <strong>backend/reset-mots-de-passe.bat</strong>
          </Alert>
        )}

        {error && <Alert variant="danger">{error}</Alert>}
        {warning && <Alert variant="warning">{warning}</Alert>}

        <Form onSubmit={submit}>
          <Form.Group className="mb-3">
            <Form.Label>Adresse e-mail</Form.Label>
            <Form.Control
              type="email"
              placeholder="admin@mbala-kwa.ci"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>Mot de passe</Form.Label>
            <Form.Control
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </Form.Group>
          <VfButton type="submit" className="w-100" disabled={loading} icon="bi-shield-lock">
            {loading ? "Connexion…" : "Se connecter"}
          </VfButton>
        </Form>

        <div className="text-center mt-3">
          <VfButton
            variant="ghost"
            size="sm"
            className="text-muted"
            onClick={() => {
              localStorage.removeItem("mbala-kwa-selemani-data-v1");
              localStorage.removeItem("mbala-kwa-selemani-auth-v1");
              localStorage.removeItem("mbala-kwa-api-token");
              localStorage.removeItem("vivre-frais-data-v1");
              localStorage.removeItem("mbalakua-selemani-data-v1");
              window.location.reload();
            }}
          >
            Réinitialiser les données de démo
          </VfButton>
        </div>

        <div className="login-demo">
          <strong>Comptes de démo</strong>
          <ul className="mb-0 mt-2">
            <li>ADM : admin@mbala-kwa.ci / admin123</li>
            <li>Vendeur : marie@mbala-kwa.ci / vendeur123</li>
            <li>Manager : manager@mbala-kwa.ci / manager123</li>
          </ul>
          <p className="small text-muted mb-0 mt-2">
            Session JWT — expiration automatique après 8 h.
          </p>
        </div>
      </div>
    </div>
  );
}
