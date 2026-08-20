import { Button, Form, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useApp } from "../../data/AppContext";

export default function Panier() {
  const {
    data,
    getProduct,
    updateCartQty,
    removeFromCart,
    clearCart,
    formatMoney,
  } = useApp();

  const total = data.cart.reduce(
    (s, i) => s + i.quantity * i.unit_price,
    0
  );

  return (
    <>
      <PageHeader
        title="Panier"
        subtitle="Articles en attente de paiement."
        actions={
          <>
            <Button
              variant="outline-danger"
              disabled={!data.cart.length}
              onClick={clearCart}
            >
              Vider
            </Button>
            <Button
              as={Link}
              to="/ventes/paiement"
              className="btn-vf"
              disabled={!data.cart.length}
            >
              Paiement
            </Button>
          </>
        }
      />
      <div className="panel">
        {!data.cart.length ? (
          <div className="empty-state">
            Panier vide. Ajoutez des produits depuis Vente au détail ou en gros.
          </div>
        ) : (
          <Table responsive hover>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Mode</th>
                <th>Prix</th>
                <th>Qté</th>
                <th>Sous-total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.cart.map((item) => {
                const product = getProduct(item.product_id);
                return (
                  <tr key={`${item.product_id}-${item.mode}`}>
                    <td className="fw-semibold">{product?.name}</td>
                    <td className="text-capitalize">{item.mode}</td>
                    <td>{formatMoney(item.unit_price)}</td>
                    <td style={{ maxWidth: 100 }}>
                      <Form.Control
                        type="number"
                        min="1"
                        max={product?.stock || 1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateCartQty(
                            item.product_id,
                            item.mode,
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>{formatMoney(item.quantity * item.unit_price)}</td>
                    <td className="text-end">
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() =>
                          removeFromCart(item.product_id, item.mode)
                        }
                      >
                        Retirer
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
        <div className="d-flex justify-content-end mt-3">
          <div className="fs-4 fw-bold" style={{ fontFamily: "var(--font-display)" }}>
            Total : {formatMoney(total)}
          </div>
        </div>
      </div>
    </>
  );
}
