import { Table, Form } from "react-bootstrap";
import PageHeader from "../../components/PageHeader";
import { useApp } from "../../data/AppContext";

export default function Prix() {
  const { data, updateProduct, formatMoney, getCategoryName } = useApp();

  return (
    <>
      <PageHeader
        title="Prix"
        subtitle="Tarifs de vente et coût d'achat fournisseur."
      />
      <div className="panel">
        <Table responsive hover>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Prix détail</th>
              <th>Prix gros</th>
              <th>Coût d&apos;achat</th>
              <th>Marge détail</th>
            </tr>
          </thead>
          <tbody>
            {data.products.map((p) => {
              const cost = Number(p.cost_price) || 0;
              return (
                <tr key={p.id}>
                  <td className="fw-semibold">{p.name}</td>
                  <td>{getCategoryName(p.category_id)}</td>
                  <td style={{ minWidth: 120 }}>
                    <Form.Control
                      type="number"
                      size="sm"
                      value={p.price_retail}
                      onChange={(e) =>
                        updateProduct(p.id, {
                          ...p,
                          price_retail: Number(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td style={{ minWidth: 120 }}>
                    <Form.Control
                      type="number"
                      size="sm"
                      value={p.price_wholesale}
                      onChange={(e) =>
                        updateProduct(p.id, {
                          ...p,
                          price_wholesale: Number(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td style={{ minWidth: 120 }}>
                    <Form.Control
                      type="number"
                      size="sm"
                      value={cost}
                      onChange={(e) =>
                        updateProduct(p.id, {
                          ...p,
                          cost_price: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </td>
                  <td>
                    {formatMoney(Math.max(0, (Number(p.price_retail) || 0) - cost))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </>
  );
}
