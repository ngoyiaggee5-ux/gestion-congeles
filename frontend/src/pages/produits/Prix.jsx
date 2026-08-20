import { Table, Form } from "react-bootstrap";
import PageHeader from "../../components/PageHeader";
import { useApp } from "../../data/AppContext";

export default function Prix() {
  const { data, updateProduct, formatMoney, getCategoryName } = useApp();

  return (
    <>
      <PageHeader
        title="Prix"
        subtitle="Gérer les tarifs détail et gros de chaque produit."
      />
      <div className="panel">
        <Table responsive hover>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Prix détail</th>
              <th>Prix gros</th>
              <th>Marge indicative</th>
            </tr>
          </thead>
          <tbody>
            {data.products.map((p) => (
              <tr key={p.id}>
                <td className="fw-semibold">{p.name}</td>
                <td>{getCategoryName(p.category_id)}</td>
                <td style={{ minWidth: 140 }}>
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
                <td style={{ minWidth: 140 }}>
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
                <td>
                  {formatMoney(
                    Math.max(0, p.price_retail - p.price_wholesale)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}
