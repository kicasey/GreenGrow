import { createContext, useContext, useMemo, useState } from "react";
import type { Product } from "../types";

export interface CartLine {
  product: Product;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  add: (product: Product, quantity?: number) => void;
  setQuantity: (productID: number, quantity: number) => void;
  remove: (productID: number) => void;
  clear: () => void;
  total: number;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const value = useMemo<CartState>(() => {
    const total = lines.reduce((sum, l) => sum + l.product.productCost * l.quantity, 0);

    return {
      lines,
      total,
      add: (product, quantity = 1) => {
        setLines(prev => {
          const existing = prev.find(l => l.product.productID === product.productID);
          if (existing) {
            return prev.map(l =>
              l.product.productID === product.productID
                ? { ...l, quantity: l.quantity + quantity }
                : l
            );
          }
          return [...prev, { product, quantity }];
        });
      },
      setQuantity: (productID, quantity) =>
        setLines(prev =>
          prev
            .map(l => (l.product.productID === productID ? { ...l, quantity } : l))
            .filter(l => l.quantity > 0)
        ),
      remove: productID =>
        setLines(prev => prev.filter(l => l.product.productID !== productID)),
      clear: () => setLines([]),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
