import React, { useEffect, useMemo, useState } from "react";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";

const PLACEHOLDER = "https://picsum.photos/seed/pooja/320/240";

// Support both shapes in localStorage (legacy/new)
export type Product = {
  id: string;
  name: string;
  price_inr: number;
  image_url?: string | null; // new
  image?: string | null;     // legacy
  collection: string;
  stock: number;
  desc?: string;
};

type CartItem = { id: string; qty: number; product: Product };

const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const getImage = (p: Product) => p.image_url || p.image || PLACEHOLDER;

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // One-time load + migrate legacy shape (image -> image_url)
  useEffect(() => {
    const raw = localStorage.getItem("cart");
    if (!raw) return;

    try {
      const parsed: CartItem[] = JSON.parse(raw);

      const migrated = parsed.map((it) => {
        const img = it.product.image_url ?? it.product.image ?? null;
        return {
          ...it,
          product: {
            ...it.product,
            image_url: img,   // normalize to image_url
            image: undefined, // optional: drop legacy field in-memory
          },
        };
      });

      setCart(migrated);
      localStorage.setItem("cart", JSON.stringify(migrated));
    } catch {
      localStorage.removeItem("cart");
    }
  }, []);

  // Keep cart in sync
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
  }, [cart]);

  const subtotal = useMemo(
    () => cart.reduce((s, it) => s + it.qty * it.product.price_inr, 0),
    [cart]
  );

  const increment = (p: Product) => {
    setCart((prev) => {
      const i = prev.findIndex((it) => it.id === p.id);
      if (i >= 0) {
        const copy = [...prev];
        const current = copy[i];
        const max = p.stock ?? Infinity;
        if (current.qty < max) copy[i] = { ...current, qty: current.qty + 1 };
        return copy;
      }
      return [...prev, { id: p.id, qty: 1, product: p }];
    });
  };

  const decrement = (p: Product) => {
    setCart((prev) => {
      const i = prev.findIndex((it) => it.id === p.id);
      if (i < 0) return prev;
      const copy = [...prev];
      const current = copy[i];
      const nextQty = current.qty - 1;
      if (nextQty <= 0) copy.splice(i, 1);
      else copy[i] = { ...current, qty: nextQty };
      return copy;
    });
  };

  const removeItem = (id: string) =>
    setCart((prev) => prev.filter((it) => it.id !== id));
  const clearAll = () => setCart([]);

  // ===== Mobile: sticky bar visibility (hide when cart empty) =====
  const hasItems = cart.length > 0;

  return (
    <div className="relative">
      <Navbar />

      <div className="min-h-screen bg-[#FAF7F2] text-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <Link
              to="/collections"
              className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium hidden sm:inline">Continue Shopping</span>
              <span className="font-medium sm:hidden">Back</span>
            </Link>

            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-orange-600">Shopping Cart</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                {cart.length} {cart.length === 1 ? "item" : "items"}
              </p>
            </div>

            <div className="w-16 sm:w-24" />
          </div>

          {cart.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-orange-50 flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-orange-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                Looks like you haven&apos;t added any items yet. Start shopping to find amazing products!
              </p>
              <Link
                to="/collections"
                className="inline-flex items-center justify-center rounded-xl px-6 sm:px-8 py-3 font-semibold text-white bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* ===== Mobile layout (cards) ===== */}
              <div className="lg:hidden">
                <div className="space-y-4">
                  {cart.map((item) => {
                    const { product, qty } = item;
                    const unit = product.price_inr;
                    const total = unit * qty;

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4"
                      >
                        <div className="flex gap-3">
                          <div className="w-24 h-24 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0">
                            <img
                              src={getImage(product)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                              }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                              {product.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {product.collection}
                            </p>

                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-base font-bold text-orange-600">
                                {money(total)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {money(unit)} each
                              </span>
                            </div>

                            {/* Quantity + Remove */}
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => decrement(product)}
                                  className="w-11 h-11 flex items-center justify-center text-gray-700 active:scale-95 transition"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-12 h-11 flex items-center justify-center text-sm font-semibold bg-white border-x border-gray-300">
                                  {qty}
                                </span>
                                <button
                                  onClick={() => increment(product)}
                                  className="w-11 h-11 flex items-center justify-center text-gray-700 active:scale-95 transition"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-2.5 text-gray-500 hover:text-red-500 transition rounded-lg hover:bg-red-50"
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ===== Desktop layout (unchanged) ===== */}
              <div className="hidden lg:block lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="col-span-5">Product</div>
                      <div className="col-span-3 text-center">Quantity</div>
                      <div className="col-span-3 text-right">Price</div>
                      <div className="col-span-1"></div>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="divide-y divide-gray-200">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* Product Info */}
                          <div className="col-span-5">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                <img
                                  src={getImage(item.product)}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src =
                                      PLACEHOLDER;
                                  }}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {item.product.name}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  {item.product.collection}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="col-span-3">
                            <div className="flex items-center justify-center">
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                  onClick={() => decrement(item.product)}
                                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors rounded-l-lg"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-12 h-10 flex items-center justify-center text-sm font-medium bg-white border-x border-gray-300">
                                  {item.qty}
                                </span>
                                <button
                                  onClick={() => increment(item.product)}
                                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors rounded-r-lg"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="col-span-3 text-right">
                            <div className="font-semibold text-orange-600 text-lg">
                              {money(item.qty * item.product.price_inr)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {money(item.product.price_inr)} each
                            </div>
                          </div>

                          {/* Remove Button */}
                          <div className="col-span-1 flex justify-end">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8 hidden lg:block">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Subtotal ({cart.length} items)</span>
                      <span className="font-semibold">{money(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Shipping</span>
                      <span className="font-semibold text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Tax</span>
                      <span className="font-semibold">Calculated at checkout</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span className="text-orange-600">{money(subtotal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Link
                      to="/checkout"
                      className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      Proceed to Checkout
                    </Link>
                    <button
                      onClick={clearAll}
                      className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Clear Cart
                    </button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                    <Link
                      to="/collections"
                      className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== Mobile Sticky Bottom Summary & CTA ===== */}
        {hasItems && (
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Subtotal</p>
                  <p className="text-lg font-bold text-gray-900">{money(subtotal)}</p>
                </div>
                <Link
                  to="/checkout"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 active:scale-95 transition"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
