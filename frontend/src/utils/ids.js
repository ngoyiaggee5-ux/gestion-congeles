export function sameId(a, b) {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

export function sumStockByCategory(products, categoryId) {
  return products
    .filter((product) => sameId(product.category_id, categoryId))
    .reduce((sum, product) => sum + (Number(product.stock) || 0), 0);
}
