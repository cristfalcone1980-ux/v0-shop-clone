'use client';

import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface CartItem {
  id: number;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  rating: number;
}

interface CartSidebarProps {
  items: CartItem[];
  products: Product[];
  onRemove: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onClose: () => void;
}

export default function CartSidebar({
  items,
  products,
  onRemove,
  onUpdateQuantity,
  onClose,
}: CartSidebarProps) {
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const productMap = new Map(products.map((p) => [p.id, p]));

  const total = items.reduce((sum, item) => {
    const product = productMap.get(item.id);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setLoading(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.id,
          productName: productMap.get(item.id)?.name,
          quantity: item.quantity,
          price: productMap.get(item.id)?.price,
          subtotal: (productMap.get(item.id)?.price || 0) * item.quantity,
        })),
        total: total,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setOrderSuccess(true);
        // Limpiar carrito después de 3 segundos
        setTimeout(() => {
          items.forEach((item) => onRemove(item.id));
          setOrderSuccess(false);
          onClose();
        }, 3000);
      }
    } catch (error) {
      console.error('Error al procesar la compra:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tu Carrito</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <X size={24} />
        </button>
      </div>

      {orderSuccess && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          ✅ ¡Compra realizada exitosamente! Te enviaremos los detalles por Telegram.
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Tu carrito está vacío</p>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Continuar comprando
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {items.map((item) => {
              const product = productMap.get(item.id);
              if (!product) return null;

              return (
                <div key={item.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-gray-600">${product.price} x {item.quantity}</p>
                  </div>

                  <div className="flex items-center space-x-3 mr-4">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-200 rounded transition"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-semibold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-200 rounded transition"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemove(item.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="border-t pt-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Seguir comprando
            </button>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Proceder al Pago'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}