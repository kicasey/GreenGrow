import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import type { Product } from "../types";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<Product>(`/api/products/${id}`)
      .then(setProduct)
      .catch(e => setError(String(e)));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!product) return <p>Loading…</p>;

  return (
    <section>
      <h2>{product.productName}</h2>
      <p className="category">{product.categoryName}</p>
      <p>{product.productDescription}</p>
      <p><strong>${product.productCost.toFixed(2)}</strong></p>
      <p>{product.quantity} in stock</p>
    </section>
  );
}
