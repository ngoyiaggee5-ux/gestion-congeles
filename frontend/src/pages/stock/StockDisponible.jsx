import { Table, Form } from "react-bootstrap";
import { useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader";
import SmartSuggest from "../../components/SmartSuggest";
import { useApp } from "../../data/AppContext";

export default function StockDisponible() {
  const { data, getCategoryName, stockStatus, formatMoney, suggestProducts } =
    useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");

  const suggestions = useMemo(
    () => suggestProducts(q, "détail"),
    [suggestProducts, q]
  );

  const rows = useMemo(() => {
    const base = q.trim()
      ? suggestProducts(q, "détail")
          .map((item) => data.products.find((p) => p.id === item.id))
          .filter(Boolean)
      : data.products;

    return base.filter((p) => !cat || String(p.category_id) === cat);
  }, [data.products, q, cat, suggestProducts]);

  return (
    <>
      <PageHeader
        title="Stock disponible"
        subtitle="Inventaire actuel du congélateur."
      />
      <div className="panel">
        <div className="d-flex flex-wrap gap-2 mb-3">
          <div style={{ flex: "1 1 280px", maxWidth: 420 }}>
            <SmartSuggest
              value={q}
              onChange={setQ}
              onSelect={(item) => setQ(item.label)}
              suggestions={suggestions}
              placeholder="Recherche intelligente produit / SKU…"
              emptyText="Aucun produit trouvé"
            />
          </div>
          <Form.Select
            style={{ maxWidth: 220 }}
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          >
            <option value="">Toutes catégories</option>
            {data.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Form.Select>
        </div>
        <Table responsive hover>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Quantité</th>
              <th>Valeur détail</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const status = stockStatus(p);
              return (
                <tr key={p.id}>
                  <td>{p.sku}</td>
                  <td className="fw-semibold">{p.name}</td>
                  <td>{getCategoryName(p.category_id)}</td>
                  <td>
                    {p.stock} {p.unit}
                  </td>
                  <td>{formatMoney(p.stock * p.price_retail)}</td>
                  <td>
                    <span
                      className={`badge-stock ${
                        status === "ok"
                          ? "badge-ok"
                          : status === "low"
                            ? "badge-low"
                            : "badge-out"
                      }`}
                    >
                      {status === "ok"
                        ? "OK"
                        : status === "low"
                          ? "Faible"
                          : "Rupture"}
                    </span>
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
