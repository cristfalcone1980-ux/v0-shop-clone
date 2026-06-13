'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import CartSidebar from '@/components/CartSidebar';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  product_type?: string;
  amazon_affiliate_link?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<Array<{ id: number; quantity: number }>>([]);
  const [showCart, setShowCart] = useState(false);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const loadProducts = async () => {
      const { data } = await supabase.from('products').select('*');
      if (data) setProducts(data);
    };
    loadProducts();
  }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 sticky top-0 z-40 px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Drop<span className="text-orange-500">bay</span></h1>
        <button onClick={() => setShowCart(!showCart)} className="relative bg-gray-800 p-3 rounded-full">
          🛒
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </button>
      </header>

      {showCart ? (
        <div className="max-w-md mx-auto px-4 py-8">
          <CartSidebar
            items={cartItems}
            products={products}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
            onClose={() => setShowCart(false)}
          />
        </div>
      ) : (
        <>
          {/* Hero */}
          <div className="bg-gradient-to-b from-gray-900 to-black px-6 py-16">
            <span className="bg-orange-500/20 text-orange-500 text-xs font-bold px-3 py-1 rounded-full">TECNOLOGÍA & MÁS</span>
            <h2 className="text-5xl font-black mt-4 mb-2">Los mejores<br />productos,<br /><span className="text-orange-500">al mejor<br />precio</span></h2>
            <p className="text-gray-400 mt-4 mb-8">Descubre nuestra selección de tecnología, gadgets y mucho más.</p>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Productos */}
          <div className="px-4 py-8">
            <h3 className="text-xl font-bold mb-6">Productos destacados <span className="text-gray-400 text-sm font-normal">{filtered.length} productos</span></h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((product) => (
                <div key={product.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-orange-500 transition-colors">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-800 flex items-center justify-center text-4xl">📦</div>
                  )}
                  <div className="p-4">
                    <h4 className="text-white font-medium mb-2">{product.name}</h4>
                    <p className="text-orange-500 font-bold text-lg mb-4">{product.price}€</p>
                    {product.product_type === 'dropshipping' && product.amazon_affiliate_link ? (
                      <a href={product.amazon_affiliate_link} target="_blank" rel="noopener noreferrer"
                        className="block w-full bg-orange-500 text-white py-2 rounded-lg text-center font-medium hover:bg-orange-600">
                        + Información
                      </a>
                    ) : (
                      <button onClick={() => addToCart(product.id)}
                        className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600">
                        Añadir al carrito
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
