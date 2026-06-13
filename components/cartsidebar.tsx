'use client';

import { useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
}

interface CartItem {
  id: number;
  quantity: number;
}

interface CartSidebarProps {
  items: CartItem[];
  products: Product[];
  onRemove: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onClose: () => void;
}

export default function CartSidebar({ items, products, onRemove, onUpdateQuantity, onClose }: CartSidebarProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'cart' | 'shipping'>('cart');
  const [shipping, setShipping] = useState({
    name: '', email: '', phone: '', address: '', city: '', zip: '',
  });

  const cartProducts = items.map((item) => ({
    ...products.find((p) => p.id === item.id)!,
    quantity: item.quantity,
  }));

  const total = cartProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'EUR',
          description: 'Pedido Dropbay',
          shipping,
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert('Error al procesar el pago');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black text-white rounded-lg p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{step === 'cart' ? 'Carrito' : 'Datos de envío'}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
      </div>

      {step === 'cart' && (
        <>
          {cartProducts.map((product) => (
            <div key={product.id} className="flex items-center gap-4 mb-4 border-b border-gray-700 pb-4">
              {product.image && <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />}
              <div className="flex-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-orange-500">{product.price}€ x {product.quantity}</p>
              </div>
              <button onClick={() => onRemove(product.id)} className="text-gray-400 hover:text-white">✕</button>
            </div>
          ))}
          <div className="flex justify-between items-center mt-6 mb-6">
            <span className="font-bold text-lg">Total:</span>
            <span className="text-orange-500 text-2xl font-bold">{total.toFixed(2)}€</span>
          </div>
          <button
            onClick={() => setStep('shipping')}
            className="w-full bg-orange-500 text-white py-4 rounded-full font-bold text-lg hover:bg-orange-600"
          >
            Continuar
          </button>
        </>
      )}

      {step === 'shipping' && (
        <>
          {['name', 'email', 'phone', 'address', 'city', 'zip'].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={{ name: 'Nombre completo', email: 'Email', phone: 'Teléfono', address: 'Dirección', city: 'Ciudad', zip: 'Código postal' }[field]}
              value={shipping[field as keyof typeof shipping]}
              onChange={(e) => setShipping({ ...shipping, [field]: e.target.value })}
              className="w-full mb-3 px-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          ))}
          <div className="flex justify-between items-center mt-4 mb-6">
            <span className="font-bold text-lg">Total:</span>
            <span className="text-orange-500 text-2xl font-bold">{total.toFixed(2)}€</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-full font-bold text-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Pagar con SumUp'}
          </button>
          <button
            onClick={() => setStep('cart')}
            className="w-full mt-3 text-gray-400 hover:text-white text-sm"
          >
            ← Volver al carrito
          </button>
        </>
      )}
    </div>
  );
}
