/**
 * Conseils contextualisés générés à partir des données du rapport (écran + impression).
 */

export function getSalesReportAdvice({
  filteredSales,
  byType,
  totalPeriod,
  formatMoney,
}) {
  const advice = [];

  if (!filteredSales.length) {
    return [
      {
        level: "warning",
        title: "Activité nulle",
        text: "Aucune vente sur cette période. Envisagez une promotion, une relance clients ou une action commerciale ciblée.",
      },
    ];
  }

  const detailTotal = byType[0]?.total || 0;
  const grosTotal = byType[1]?.total || 0;
  const count = filteredSales.length;
  const avgTicket = totalPeriod / count;

  if (grosTotal > detailTotal * 1.4 && grosTotal > 0) {
    advice.push({
      level: "info",
      title: "Ventes en gros dominantes",
      text: "Le gros représente la majorité du chiffre d'affaires. Assurez-vous d'avoir le stock suffisant pour honorer les commandes en volume.",
    });
  } else if (detailTotal > grosTotal * 1.4 && detailTotal > 0) {
    advice.push({
      level: "info",
      title: "Ventes au détail dominantes",
      text: "Le détail porte vos ventes. Proposez des tarifs gros aux clients réguliers pour développer le panier moyen.",
    });
  }

  advice.push({
    level: "success",
    title: "Panier moyen",
    text: `${formatMoney(avgTicket)} par vente, sur ${count} transaction(s) enregistrée(s).`,
  });

  const clientTotals = {};
  for (const sale of filteredSales) {
    const name = sale.client_name?.trim() || "Client passage";
    clientTotals[name] = (clientTotals[name] || 0) + sale.total;
  }
  const topClient = Object.entries(clientTotals).sort((a, b) => b[1] - a[1])[0];
  if (topClient && topClient[1] > 0) {
    advice.push({
      level: "info",
      title: "Client principal",
      text: `${topClient[0]} est le meilleur contributeur de la période (${formatMoney(topClient[1])}).`,
    });
  }

  const cashRatio =
    filteredSales.filter((s) => s.payment_method === "espèces").length / count;
  if (cashRatio >= 0.75) {
    advice.push({
      level: "neutral",
      title: "Paiements en espèces",
      text: "La plupart des ventes sont en espèces. Pensez à contrôler la caisse et à déposer les excédents en sécurité.",
    });
  }

  return advice.slice(0, 4);
}

export function getStockReportAdvice({
  data,
  stockStatus,
  filteredMovements,
  entrees,
  sorties,
  valeur,
  formatMoney,
}) {
  const advice = [];
  const outOfStock = data.products.filter((p) => stockStatus(p) === "out");
  const lowStock = data.products.filter((p) => stockStatus(p) === "low");

  if (outOfStock.length) {
    const names = outOfStock
      .map((p) => p.name)
      .slice(0, 3)
      .join(", ");
    advice.push({
      level: "danger",
      title: "Ruptures de stock",
      text: `Réapprovisionnement urgent : ${names}${outOfStock.length > 3 ? "…" : ""} (${outOfStock.length} produit(s)).`,
    });
  }

  if (lowStock.length) {
    advice.push({
      level: "warning",
      title: "Stock faible",
      text: `${lowStock.length} produit(s) sous le seuil minimum. Planifiez une entrée de stock avant rupture.`,
    });
  }

  if (filteredMovements.length && sorties > entrees * 1.2) {
    advice.push({
      level: "warning",
      title: "Stock en baisse",
      text: "Les sorties dépassent nettement les entrées sur la période. Anticipez les commandes fournisseurs.",
    });
  } else if (entrees > sorties * 2 && entrees > 0) {
    advice.push({
      level: "info",
      title: "Entrées importantes",
      text: "Beaucoup d'entrées et peu de sorties. Surveillez le surstockage et la rotation des produits.",
    });
  }

  if (valeur > 0) {
    advice.push({
      level: "success",
      title: "Valeur du stock",
      text: `Capital immobilisé (coût d'achat) : ${formatMoney(valeur)}. Ajustez vos achats en fonction de la demande.`,
    });
  }

  if (!advice.length) {
    advice.push({
      level: "success",
      title: "Stock sain",
      text: "Aucune alerte critique. Continuez à suivre les mouvements régulièrement.",
    });
  }

  return advice.slice(0, 4);
}

export function getProfitReportAdvice({
  rows,
  totalSales,
  totalProfit,
  formatMoney,
}) {
  const advice = [];

  if (!rows.length) {
    return [
      {
        level: "warning",
        title: "Données insuffisantes",
        text: "Aucune vente sur la période — impossible d'analyser la rentabilité. Revenez après quelques transactions.",
      },
    ];
  }

  const marginPct = totalSales ? (totalProfit / totalSales) * 100 : 0;

  if (marginPct < 15) {
    advice.push({
      level: "danger",
      title: "Marge faible",
      text: `Marge globale de ${marginPct.toFixed(1)} %. Revoir les prix de vente ou renégocier les coûts d'achat.`,
    });
  } else if (marginPct >= 30) {
    advice.push({
      level: "success",
      title: "Bonne rentabilité",
      text: `Marge globale solide (${marginPct.toFixed(1)} %). Maintenez cette politique tarifaire.`,
    });
  } else {
    advice.push({
      level: "info",
      title: "Marge correcte",
      text: `Marge globale de ${marginPct.toFixed(1)} %. Surveillez les ventes les moins rentables ci-dessous.`,
    });
  }

  advice.push({
    level: "success",
    title: "Bénéfice net",
    text: `Bénéfice sur la période : ${formatMoney(totalProfit)} pour ${formatMoney(totalSales)} de chiffre d'affaires.`,
  });

  const lowMargin = rows.filter((r) => r.margin < 10 && r.sale.total > 0);
  if (lowMargin.length) {
    advice.push({
      level: "warning",
      title: "Marges basses",
      text: `${lowMargin.length} vente(s) avec une marge inférieure à 10 %. Vérifiez les remises appliquées.`,
    });
  }

  const atLoss = rows.filter((r) => r.profit < 0);
  if (atLoss.length) {
    advice.push({
      level: "danger",
      title: "Ventes à perte",
      text: `${atLoss.length} vente(s) vendue(s) en dessous du coût. Corrigez les prix ou limitez les promotions.`,
    });
  }

  return advice.slice(0, 4);
}

export const ADVICE_LEVEL_LABELS = {
  danger: "Urgent",
  warning: "Attention",
  info: "Conseil",
  success: "Positif",
  neutral: "Info",
};

export const ADVICE_LEVEL_ICONS = {
  danger: "bi-exclamation-octagon-fill",
  warning: "bi-exclamation-triangle-fill",
  info: "bi-lightbulb-fill",
  success: "bi-check-circle-fill",
  neutral: "bi-info-circle-fill",
};
