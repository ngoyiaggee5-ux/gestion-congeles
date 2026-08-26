import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Alert, Form } from "react-bootstrap";
import Logo from "../components/Logo";
import PasswordField from "../components/PasswordField";
import VfButton from "../components/VfButton";
import { useApp } from "../data/AppContext";
import { getDefaultHomeForRole } from "../utils/permissions";

export default function Login() {
  const { login, isAuthenticated, currentUser } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);

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

        {error && <Alert variant="danger">{error}</Alert>}
        {warning && <Alert variant="warning">{warning}</Alert>}

        <Form onSubmit={submit}>
          <Form.Group className="mb-3">
            <Form.Label>Adresse e-mail</Form.Label>
            <Form.Control
              type="email"
              placeholder="votre@email.ci"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </Form.Group>
          <div className="mb-4">
            <PasswordField
              id="login-password"
              label="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <VfButton type="submit" className="w-100" disabled={loading} icon="bi-shield-lock">
            {loading ? "Connexion…" : "Se connecter"}
          </VfButton>
        </Form>
      </div>
    </div>
  );
}
