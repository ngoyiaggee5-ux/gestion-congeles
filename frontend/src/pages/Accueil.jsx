import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import LoginParticles from "../components/LoginParticles";
import { useApp } from "../data/AppContext";
import { getDefaultHomeForRole } from "../utils/permissions";

const SPLASH_MS = 5000;

export default function Accueil() {
  const navigate = useNavigate();
  const { isAuthenticated, authReady, currentUser } = useApp();

  useEffect(() => {
    if (!authReady) return;

    if (isAuthenticated) {
      navigate(getDefaultHomeForRole(currentUser?.role) || "/dashboard", {
        replace: true,
      });
      return;
    }

    const timer = window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, SPLASH_MS);

    return () => window.clearTimeout(timer);
  }, [authReady, isAuthenticated, currentUser, navigate]);

  return (
    <div
      className="splash-page"
      style={{ "--splash-duration": `${SPLASH_MS}ms` }}
      role="presentation"
    >
      <LoginParticles />
      <div className="splash-shell">
        <aside className="login-brand-panel splash-brand-panel">
          <Logo size={96} className="login-logo" />
          <p className="login-kicker">Congélateur commercial</p>
          <h1>MBALA KWA SELEMANI</h1>
          <p className="login-tagline">
            Caisse, stock froid et factures — une seule application pour votre
            quotidien.
          </p>
          <ul className="login-highlights">
            <li>
              <i className="bi bi-snow" aria-hidden="true" /> Stock froid suivi en
              direct
            </li>
            <li>
              <i className="bi bi-lightning-charge" aria-hidden="true" />{" "}
              Encaissement détail &amp; gros
            </li>
            <li>
              <i className="bi bi-shield-check" aria-hidden="true" /> Connexion
              sécurisée
            </li>
          </ul>
          <div className="splash-progress" aria-hidden="true">
            <div className="splash-progress-bar" />
          </div>
          <p className="splash-hint">Chargement de la connexion…</p>
        </aside>
      </div>
    </div>
  );
}
