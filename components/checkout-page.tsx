'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface CartItem {
  product: {
    id: string
    name: string
    price: number
    image_url: string
  }
  quantity: number
}

interface CheckoutPageProps {
  cart: CartItem[]
  onOrderComplete: () => void
}

export default function CheckoutPage({ cart, onOrderComplete }: CheckoutPageProps) {
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    province: '',
    notes: '',
  })

  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'simup' | 'bizum' | 'bank_transfer'>('simup')

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const supabase = createClient()

  // Función interna para disparar la alerta a Telegram de manera directa y segura
  const enviarNotificacionTelegram = async (orderId: string) => {
    try {
      const botToken = '8949940366:AAEyUdsLDxrsB-hVmBUD5Zb8BV1Y5L1AB24'
      const chatId = '7151205555'
      
      const mensaje = `🔔 ¡NUEVO PEDIDO RECIBIDO! 🚀\n\n` +
                      `💰 Total: ${total.toFixed(2)} EUR\n` +
                      `💳 Método: ${paymentMethod.toUpperCase()}\n` +
                      `📦 ID Pedido: ${orderId}\n\n` +
                      `👤 Cliente: ${formData.name} ${formData.surname}\n` +
                      `📧 Email: ${formData.email}\n` +
                      `📞 Telf: ${formData.phone || 'No indicado'}\n` +
                      `📍 Dirección: ${formData.address}, ${formData.city} (${formData.postalCode})`

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: mensaje,
        }),
      })
    } catch (e) {
      console.error('Error enviando notificación a Telegram:', e)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.address || !formData.city || !formData.postalCode) {
      setError('Por favor rellena todos los campos obligatorios')
      return
    }
    setError('')
    setStep('payment')
  }

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user?.id || null,
          customer_name: `${formData.name} ${formData.surname} (${formData.email})`,
          customer_phone: formData.phone,
          shipping_address: `${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.province}`,
          notes: formData.notes,
          payment_method: paymentMethod,
          total_amount: total,
          status: 'pending',
        }])
        .select()
        .single()

      if (orderError) throw orderError

      // Guardar items del pedido
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }))

      await supabase.from('order_items').insert(orderItems)

      // ¡ALERTA LANZADA DESDE LA WEB! Sin depender de servidores externos de SQL
      await enviarNotificacionTelegram(order.id)

      setStep('success')
      onOrderComplete()
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pedido')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold mb-4">¡Pedido realizado!</h1>
          <p className="text-white/60 mb-2">Gracias por tu compra. Recibirás un email de confirmación en breve.</p>
          <p className="text-white/40 text-sm mb-8">Procesaremos tu pedido y te enviaremos la información de seguimiento.</p>
          <Link href="/">
            <button className="px-6 py-3 bg-[#f97316] hover:bg-[#ea6c0a] rounded-full font-semibold transition">
              Seguir comprando
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Drop<span className="text-[#f97316]">bay</span>
          </Link>
          <span className="text-white/40 text-sm">Checkout seguro 🔒</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className={`flex items-center gap-2 text-sm font-medium ${step === 'form' ? 'text-[#f97316]' : 'text-white/40'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'form' ? 'bg-[#f97316]' : 'bg-white/20'}`}>1</span>
              Datos de envío
            </div>
            <div className="flex-1 h-px bg-white/10" />
            <div className={`flex items-center gap-2 text-sm font-medium ${step === 'payment' ? 'text-[#f97316]' : 'text-white/40'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'payment' ? 'bg-[#f97316]' : 'bg-white/20'}`}>2</span>
              Pago
            </div>
          </div>

          {step === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Datos de envío</h2>

              {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Nombre *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#f97316]"
                    placeholder="Juan" required />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Apellidos *</label>
                  <input type="text" value={formData.surname} onChange={(e) => setFormData({...formData, surname: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#f97316]"
                    placeholder="García" required />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Email *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#f97316]"
                  placeholder="tu@email.com" required />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Teléfono</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#f97316]"
                  placeholder="+34 600 000 000" />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Dirección *</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#f97316]"
                  placeholder="Calle Mayor, 1, 2ºA" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Ciudad *</label>
                  <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#f97316]"
                    placeholder="Madrid" required />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Código Postal *</label>
                  <input type="text" value={formData.postalCode} onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#f97316]"
                    placeholder="28001" required />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Provincia</label>
                <input type="text" value={formData.province} onChange={(e) => setFormData({...formData, province: e.target.value})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#f97316]"
                  placeholder="Madrid" />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Notas del pedido</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#f97316]"
                  placeholder="Instrucciones especiales de entrega..." rows={2} />
              </div>

              <button type="submit" className="w-full py-3 bg-[#f97316] hover:bg-[#ea6c0a] rounded-xl font-semibold transition">
                Continuar al pago →
              </button>
            </form>
          )}

          {step === 'payment' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <button onClick={() => setStep('form')} className="text-white/40 hover:text-white text-sm">← Volver</button>
                <h2 className="text-xl font-bold">Método de pago</h2>
              </div>

              {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}

              <div className="space-y-3">
                {[
                  { id: 'simup', label: 'Tarjeta de crédito/débito', icon: '💳', desc: 'Pago seguro con Simup' },
                  { id: 'paypal', label: 'PayPal', icon: '🅿️', desc: 'Paga con tu cuenta PayPal' },
                  { id: 'bizum', label: 'Bizum', icon: '📱', desc: 'Pago instantáneo con Bizum' },
                  { id: 'bank_transfer', label: 'Transferencia bancaria', icon: '🏦', desc: 'Transferencia directa' },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition text-left ${
                      paymentMethod === method.id
                        ? 'border-[#f97316] bg-[#f97316]/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <p className="font-medium">{method.label}</p>
                      <p className="text-white/40 text-xs">{method.desc}</p>
                    </div>
                    {paymentMethod === method.id && <span className="ml-auto text-[#f97316]">✓</span>}
                  </button>
                ))}
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-3 bg-[#f97316] hover:bg-[#ea6c0a] rounded-xl font-semibold transition disabled:opacity-50"
              >
                {loading ? 'Procesando...' : `Pagar ${total.toFixed(2)}€`}
              </button>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3">
                {item.product.image_url && (
                  <img src={item.product.image_url} alt={item.product.name} className="w-14 h-14 object-cover rounded-lg" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                  <p className="text-white/40 text-xs">Cantidad: {item.quantity}</p>
                </div>
                <p className="text-[#f97316] font-semibold">{(item.product.price * item.quantity).toFixed(2)}€</p>
              </div>
            ))}

            <div className="border-t border-white/10 pt-4">
              <div className="flex justify-between text-sm text-white/60 mb-2">
                <span>Subtotal</span>
                <span>{total.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm text-white/60 mb-3">
                <span>Envío</span>
                <span className="text-green-400 font-semibold">GRATIS</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-[#f97316]">{total.toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
