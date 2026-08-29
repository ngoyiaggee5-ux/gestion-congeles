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
  const [emailFocused, setEmailFocused] = useState(false);

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
      setEmail("");
      setPassword("");
      if (result.warning) setWarning(result.warning);
      navigate(getDefaultHomeForRole(result.user?.role), { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <aside className="login-brand-panel">
          <Logo size={96} className="login-logo" />
          <p className="login-kicker">Congélateur commercial</p>
          <h1>MBALA KWA SELEMANI</h1>
          <p className="login-tagline">
            Caisse, stock froid et factures — une seule application pour votre
            quotidien.
          </p>
          <ul className="login-highlights">
            <li>
              <i className="bi bi-snow" /> Stock froid suivi en direct
            </li>
            <li>
              <i className="bi bi-lightning-charge" /> Encaissement détail & gros
            </li>
            <li>
              <i className="bi bi-shield-check" /> Connexion sécurisée
            </li>
          </ul>
        </aside>

        <div className="login-card">
          <div className="login-brand login-brand-mobile">
            <Logo size={72} className="login-logo" />
            <h1>MBALA KWA SELEMANI</h1>
            <p>Connexion sécurisée</p>
          </div>

          <h2 className="login-form-title">Se connecter</h2>
          <p className="login-form-sub">Accédez à votre espace de travail.</p>

          {error && <Alert variant="danger">{error}</Alert>}
          {warning && <Alert variant="warning">{warning}</Alert>}

          <Form
            onSubmit={submit}
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore
            data-bwignore="true"
          >
            <div className="login-autofill-trap" aria-hidden="true">
              <input type="text" name="username" autoComplete="username" tabIndex={-1} defaultValue="" readOnly />
              <input type="password" name="password" autoComplete="current-password" tabIndex={-1} defaultValue="" readOnly />
            </div>

            <Form.Group className="mb-3">
              <Form.Label htmlFor="mbala-user-identity">Adresse e-mail</Form.Label>
              <Form.Control
                id="mbala-user-identity"
                type="text"
                inputMode="email"
                name="mbala_user_identity"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => {
                  if (!emailFocused) {
                    setEmailFocused(true);
                    e.target.removeAttribute("readonly");
                  }
                }}
                required
                pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                title="Adresse e-mail invalide"
                readOnly={!emailFocused}
                autoComplete="off"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore
                data-bwignore="true"
                data-form-type="other"
              />
            </Form.Group>
            <div className="mb-4">
              <PasswordField
                id="mbala-secret-code"
                name="mbala_secret_code"
                label="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                antiAutofill
                required
              />
            </div>
            <VfButton type="submit" className="w-100" disabled={loading} icon="bi-shield-lock">
              {loading ? "Connexion…" : "Entrer"}
            </VfButton>
          </Form>
        </div>
      </div>
    </div>
  );
}
