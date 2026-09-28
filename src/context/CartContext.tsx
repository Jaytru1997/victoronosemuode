"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useToast } from "@/src/context/ToastContext";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  currency?: string;
  coverImage: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  totalAmount: number;
  formatPrice: (amount: number, currency?: string) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "victoronosemuode_cart_v1";

export function formatCurrency(amount: number, currency = "NGN"): string {
  if (currency === "NGN") {
    return `₦${amount.toLocaleString()}`;
  }
  return `$${amount.toFixed(2)}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { success, info } = useToast();

  // Load cart from localStorage after the initial render to keep hydration stable.
  useEffect(() => {
    const hydrateCart = () => {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          setItems(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load cart from localStorage", e);
      } finally {
        setIsHydrated(true);
      }
    };

    const frameId = window.requestAnimationFrame(hydrateCart);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  // Save cart to localStorage on updates
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error("Failed to persist cart to localStorage", e);
      }
    }
  }, [items, isHydrated]);

  const addToCart = (newItem: Omit<CartItem, "quantity">, qty = 1) => {
    const existingItem = items.find((item) => item.id === newItem.id);

    setItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { ...newItem, quantity: qty }];
    });
    setIsCartOpen(true);
    success(
      existingItem
        ? `${newItem.title} quantity increased to ${existingItem.quantity + qty}.`
        : `${newItem.title} was added to your cart.`,
      { title: existingItem ? "Cart updated" : "Added to cart" }
    );
  };

  const removeFromCart = (id: string) => {
    const removedItem = items.find((item) => item.id === id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (removedItem) {
      info(`${removedItem.title} was removed from your cart.`, {
        title: "Removed from cart",
      });
    }
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        totalItems,
        totalAmount,
        formatPrice: formatCurrency,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
