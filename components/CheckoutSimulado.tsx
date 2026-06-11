"use client";
import { useState } from 'react';

export default function CheckoutSimulado() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // Datos ficticios de la compra para la simulación
  const mockOrder = {
    orderId: Math.floor(100000 + Math.random() * 900000).toString(),
    customerName: "Juan Pérez (Test)",
    email: "juan.perez@example.com",
    total: 89.97,
    items: [
      { name: "Camiseta Deportiva v0", quantity: 2 },
      { name: "Gorra Ajustable", quantity: 1 }
    ]
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    setStatus('Procesando pago ficticio...');
    
    try {
      const response = await fetch('/api/checkout-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockOrder),
      });

      const data = await response.json();
      if (data.success) {
        setStatus('✅ ¡Pago simulado con éxito! Revisa tu Telegram.');
      } else {
        setStatus('❌ El pago se procesó, pero falló el envío a Telegram.');
      }
    } catch (error) {
      setStatus('❌ Error de conexión al simular la transacción.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 border">
      <h2 className="text-xl font-bold text-gray-900">Entorno de Pruebas</h2>
      <p className="text-sm text-gray-500">Haz clic abajo para gatillar una compra de prueba hacia tu bot.</p>
      
      <div className="border-t pt-4">
        <div className="flex justify-between font-bold mb-4">
          <span>Total a pagar:</span>
          <span>${mockOrder.total}</span>
        </div>
        
        <button
          onClick={handleSimulatePayment}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Enviando alerta...' : 'Confirmar Pago Simulado'}
        </button>
      </div>
      {status && <p className="text-xs text-center font-semibold mt-2">{status}</p>}
    </div>
  );
}
