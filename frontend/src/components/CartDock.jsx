import { Link } from "react-router-dom";
import VfButton from "./VfButton";

export default function CartDock({ count, total, formatMoney, payHref = "/ventes/paiement" }) {
  if (count <= 0) return null;

  return (
    <div className="cart-dock no-print">
      <div className="cart-dock-inner">
        <div className="cart-dock-meta">
          <span className="cart-dock-badge">{count}</span>
          <div>
            <div className="cart-dock-label">Panier</div>
            <div className="cart-dock-total">{formatMoney(total)}</div>
          </div>
        </div>
        <div className="cart-dock-actions">
          <VfButton as={Link} to="/ventes/panier" variant="outline" size="sm" icon="bi-basket">
            Voir
          </VfButton>
          <VfButton as={Link} to={payHref} size="sm" icon="bi-credit-card">
            Payer
          </VfButton>
        </div>
      </div>
    </div>
  );
}
