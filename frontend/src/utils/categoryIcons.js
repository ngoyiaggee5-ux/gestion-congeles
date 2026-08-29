const RULES = [
  { match: /poisson|fish|saumon|crevette|crustac/i, icon: "bi-water" },
  { match: /viande|poulet|bœuf|boeuf|porc|agneau/i, icon: "bi-egg-fried" },
  { match: /légume|legume|fruit|salade/i, icon: "bi-flower1" },
  { match: /surgel|glace|froid/i, icon: "bi-snow2" },
  { match: /boisson|jus/i, icon: "bi-cup-straw" },
];

export function getCategoryIcon(name = "") {
  const label = String(name);
  for (const rule of RULES) {
    if (rule.match.test(label)) return rule.icon;
  }
  return "bi-box-seam";
}
