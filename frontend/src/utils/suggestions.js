function normalize(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function scoreMatch(query, text) {
  const q = normalize(query);
  const t = normalize(text);
  if (!q) return 1;
  if (!t) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 85;
  if (t.includes(q)) return 70;
  const parts = q.split(/\s+/).filter(Boolean);
  const matched = parts.filter((part) => t.includes(part)).length;
  return matched ? 40 + matched * 10 : 0;
}

export function suggestClients(data, query = "", saleType = "détail") {
  const map = new Map();

  for (const client of data.clients) {
    map.set(`c-${client.id}`, {
      id: client.id,
      name: client.name,
      type: client.type,
      phone: client.phone,
      source: "registered",
      frequency: 0,
      lastSeen: null,
    });
  }

  for (const sale of data.sales) {
    const name = sale.client_name?.trim();
    if (!name) continue;
    const key = normalize(name);
    const existing = [...map.values()].find((c) => normalize(c.name) === key);
    const entry =
      existing ||
      (() => {
        const created = {
          id: null,
          name,
          type: sale.type === "gros" ? "gros" : "détail",
          phone: "",
          source: "history",
          frequency: 0,
          lastSeen: null,
        };
        map.set(`h-${key}`, created);
        return created;
      })();

    entry.frequency += 1;
    if (!entry.lastSeen || sale.created_at > entry.lastSeen) {
      entry.lastSeen = sale.created_at;
      entry.type = sale.type === "gros" ? "gros" : entry.type;
    }
  }

  return [...map.values()]
    .map((client) => {
      const textScore = scoreMatch(query, client.name);
      const typeBonus =
        saleType === "gros" && client.type === "gros"
          ? 12
          : saleType === "détail" && client.type === "détail"
            ? 8
            : 0;
      const freqBonus = Math.min(client.frequency * 6, 30);
      const recentBonus = client.lastSeen
        ? Math.max(0, 15 - Math.floor((Date.now() - new Date(client.lastSeen)) / 86400000))
        : 0;
      const registeredBonus = client.source === "registered" ? 10 : 0;
      const score = query
        ? textScore + typeBonus + freqBonus + recentBonus + registeredBonus
        : freqBonus + recentBonus + registeredBonus + typeBonus;

      let badge = "Client";
      if (client.frequency >= 3) badge = "Client fidèle";
      else if (client.source === "history") badge = "Récent";
      if (client.type === "gros") badge = `${badge} · Gros`;

      return { ...client, score, badge };
    })
    .filter((client) => !query || client.score >= 40)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

export function suggestProducts(data, query = "", mode = "détail") {
  const popularity = {};
  for (const sale of data.sales) {
    for (const item of sale.items) {
      popularity[item.product_id] =
        (popularity[item.product_id] || 0) + item.quantity;
    }
  }

  return data.products
    .map((product) => {
      const category = data.categories.find((c) => c.id === product.category_id);
      const text = `${product.name} ${product.sku} ${category?.name || ""}`;
      const textScore = scoreMatch(query, text);
      const stockBonus = product.stock > 0 ? 15 : -50;
      const popBonus = Math.min((popularity[product.id] || 0) * 2, 24);
      const price =
        mode === "gros" ? product.price_wholesale : product.price_retail;
      const score = query
        ? textScore + stockBonus + popBonus
        : stockBonus + popBonus;

      let badge = product.stock <= 0 ? "Rupture" : "Disponible";
      if ((popularity[product.id] || 0) >= 5) badge = "Best-seller";

      return {
        id: product.id,
        label: product.name,
        meta: `${product.sku} · ${product.stock} ${product.unit}`,
        price,
        stock: product.stock,
        badge,
        score,
      };
    })
    .filter((item) => !query || item.score >= 35)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

export function getSmartInsights(data, stockStatus) {
  const insights = [];
  const outOfStock = data.products.filter((p) => stockStatus(p) === "out");
  const lowStock = data.products.filter((p) => stockStatus(p) === "low");
  const cartCount = data.cart.reduce((n, i) => n + i.quantity, 0);
  const today = new Date().toISOString().slice(0, 10);
  const todaySales = data.sales.filter((s) => s.created_at.startsWith(today));

  if (cartCount > 0) {
    insights.push({
      type: "info",
      severity: "info",
      icon: "bi-cart-check-fill",
      title: "Encaissement en attente",
      text: `${cartCount} article(s) dans le panier peuvent être facturés maintenant.`,
      to: "/ventes/paiement",
      action: "Aller au paiement",
    });
  }

  if (outOfStock.length) {
    insights.push({
      type: "danger",
      severity: "rupture",
      icon: "bi-x-octagon-fill",
      title: "Rupture de stock",
      text: `${outOfStock.map((p) => p.name).slice(0, 3).join(", ")}${outOfStock.length > 3 ? " …" : ""}`,
      to: "/stock/disponible",
      action: "Voir le stock",
    });
  }

  if (lowStock.length) {
    insights.push({
      type: "warning",
      severity: "faible",
      icon: "bi-exclamation-triangle-fill",
      title: "Stock faible",
      text: `${lowStock.map((p) => p.name).slice(0, 3).join(", ")}${lowStock.length > 3 ? " …" : ""}`,
      to: "/stock/disponible",
      action: "Consulter le stock",
    });
  }

  if (todaySales.length === 0 && data.sales.length) {
    insights.push({
      type: "neutral",
      severity: "neutre",
      icon: "bi-lightning-fill",
      title: "Aucune vente aujourd’hui",
      text: "Lancez une vente au détail ou en gros pour relancer l’activité.",
      to: "/ventes/detail",
      action: "Ouvrir la caisse",
    });
  } else if (todaySales.length >= 1) {
    const total = todaySales.reduce((s, sale) => s + sale.total, 0);
    insights.push({
      type: "success",
      severity: "succes",
      icon: "bi-graph-up-arrow",
      title: `${todaySales.length} vente(s) aujourd’hui`,
      text: `Chiffre du jour en progression — total enregistré.`,
      to: "/rapports/ventes",
      action: "Voir le rapport",
      extra: total,
    });
  }

  const clientCounts = {};
  for (const sale of data.sales) {
    const key = sale.client_name || `id-${sale.client_id}`;
    if (!key) continue;
    clientCounts[key] = (clientCounts[key] || 0) + 1;
  }
  const topClient = Object.entries(clientCounts).sort((a, b) => b[1] - a[1])[0];
  if (topClient && topClient[1] >= 2) {
    insights.push({
      type: "success",
      severity: "succes",
      icon: "bi-person-heart",
      title: "Client à privilégier",
      text: `${topClient[0].replace(/^id-\d+$/, "Client enregistré")} revient souvent (${topClient[1]} achats).`,
      to: "/ventes/paiement",
      action: "Nouvelle vente",
    });
  }

  const popularity = {};
  for (const sale of data.sales) {
    for (const item of sale.items) {
      popularity[item.product_id] =
        (popularity[item.product_id] || 0) + item.quantity;
    }
  }
  const topProductId = Number(
    Object.entries(popularity).sort((a, b) => b[1] - a[1])[0]?.[0]
  );
  const topProduct = data.products.find((p) => p.id === topProductId);
  if (topProduct) {
    insights.push({
      type: "neutral",
      severity: "neutre",
      icon: "bi-stars",
      title: "Produit star",
      text: `${topProduct.name} se vend le mieux — pensez à maintenir le stock.`,
      to: "/stock/disponible",
      action: "Voir le stock",
    });
  }

  return insights.slice(0, 5);
}
