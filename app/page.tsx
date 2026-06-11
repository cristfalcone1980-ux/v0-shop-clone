'use client';

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import CartSidebar from '@/components/CartSidebar';
import Header from '@/components/Header';
import { products } from '@/lib/products';

export default function Home() {
  const [cartItems, setCartItems] = useState<Array<{ id: number; quantity: number }>>([]);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (productId: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={cartItems.length} onCartClick={() => setShowCart(!showCart)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showCart ? (
          <CartSidebar
            items={cartItems}
            products={products}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
            onClose={() => setShowCart(false)}
          />
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido a V0 Shop</h1>
            <p className="text-gray-600 mb-8">Descubre nuestros productos exclusivos</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}