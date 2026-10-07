import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Alert, Form, Spinner } from "react-bootstrap";
import LoginParticles from "../components/LoginParticles";
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

  const canSubmit = Boolean(email.trim() && password) && !loading;

  const clearFeedback = () => {
    if (error) setError("");
    if (warning) setWarning("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
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
      setError(result.message || "Connexion impossible. Vérifiez vos identifiants.");
    }
  };

  return (
    <div className="login-page">
      <LoginParticles />
      <div className="login-shell login-shell--glass login-shell--solo">
        <div className="login-card">
          <div className="login-form-header">
            <h1 className="login-form-title">Se connecter</h1>
            <p className="login-form-sub">
              Accédez à votre caisse, stock et factures.
            </p>
            <span className="login-secure-badge">
              <i className="bi bi-lock-fill" aria-hidden="true" />
              Connexion sécurisée
            </span>
          </div>

          {error && (
            <Alert variant="danger" className="login-alert" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2" aria-hidden="true" />
              {error}
            </Alert>
          )}
          {warning && (
            <Alert variant="warning" className="login-alert" role="status">
              {warning}
            </Alert>
          )}

          <Form
            onSubmit={submit}
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore
            data-bwignore="true"
            aria-busy={loading}
          >
            <div className="login-autofill-trap" aria-hidden="true">
              <input
                type="text"
                name="username"
                autoComplete="username"
                tabIndex={-1}
                defaultValue=""
                readOnly
              />
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                tabIndex={-1}
                defaultValue=""
                readOnly
              />
            </div>

            <Form.Group className="mb-3 login-field">
              <Form.Label htmlFor="mbala-user-identity">Adresse e-mail</Form.Label>
              <div className="login-field-input">
                <Form.Control
                  id="mbala-user-identity"
                  type="text"
                  inputMode="email"
                  name="mbala_user_identity"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => {
                    clearFeedback();
                    setEmail(e.target.value);
                  }}
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
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={loading}
                  aria-invalid={Boolean(error)}
                  data-lpignore="true"
                  data-1p-ignore
                  data-bwignore="true"
                  data-form-type="other"
                />
                <span className="login-field-line" aria-hidden="true" />
              </div>
            </Form.Group>
            <div className="mb-4 login-field">
              <PasswordField
                id="mbala-secret-code"
                name="mbala_secret_code"
                label="Mot de passe"
                value={password}
                onChange={(e) => {
                  clearFeedback();
                  setPassword(e.target.value);
                }}
                antiAutofill
                required
                underline
                disabled={loading}
              />
            </div>
            <VfButton
              type="submit"
              className="w-100 login-submit-btn"
              disabled={!canSubmit}
              icon={loading ? undefined : "bi-box-arrow-in-right"}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Connexion…
                </>
              ) : (
                "Entrer"
              )}
            </VfButton>
            <p className="login-footnote">
              Utilisez le compte fourni par votre administrateur.
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
}
