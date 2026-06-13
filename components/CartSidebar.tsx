'use client';

import { useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
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
    <div style={{background:'#111',color:'white',borderRadius:'12px',padding:'24px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
        <h2 style={{margin:0,fontSize:'24px'}}>{step === 'cart' ? 'Carrito' : 'Datos de envío'}</h2>
        <button onClick={onClose} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'20px',cursor:'pointer'}}>✕</button>
      </div>

      {step === 'cart' && (
        <>
          {cartProducts.map((product) => (
            <div key={product.id} style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'16px',borderBottom:'1px solid #222',paddingBottom:'16px'}}>
              {product.image_url && <img src={product.image_url} alt={product.name} style={{width:'64px',height:'64px',objectFit:'cover',borderRadius:'8px'}} />}
              <div style={{flex:1}}>
                <p style={{margin:0,fontWeight:'500'}}>{product.name}</p>
                <p style={{margin:0,color:'#f97316'}}>{product.price}€ x {product.quantity}</p>
              </div>
              <button onClick={() => onRemove(product.id)} style={{background:'none',border:'none',color:'#9ca3af',cursor:'pointer',fontSize:'18px'}}>✕</button>
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',marginTop:'24px',marginBottom:'24px'}}>
            <span style={{fontWeight:'bold',fontSize:'18px'}}>Total:</span>
            <span style={{color:'#f97316',fontWeight:'bold',fontSize:'24px'}}>{total.toFixed(2)}€</span>
          </div>
          <button onClick={() => setStep('shipping')} style={{width:'100%',background:'#f97316',color:'white',border:'none',padding:'16px',borderRadius:'999px',fontWeight:'bold',fontSize:'18px',cursor:'pointer'}}>
            Continuar
          </button>
        </>
      )}

      {step === 'shipping' && (
        <>
          {[
            {field:'name',placeholder:'Nombre completo'},
            {field:'email',placeholder:'Email'},
            {field:'phone',placeholder:'Teléfono'},
            {field:'address',placeholder:'Dirección'},
            {field:'city',placeholder:'Ciudad'},
            {field:'zip',placeholder:'Código postal'},
          ].map(({field, placeholder}) => (
            <input
              key={field}
              type="text"
              placeholder={placeholder}
              value={shipping[field as keyof typeof shipping]}
              onChange={(e) => setShipping({...shipping, [field]: e.target.value})}
              style={{width:'100%',marginBottom:'12px',padding:'12px 16px',background:'#1f1f1f',border:'none',color:'white',borderRadius:'8px',fontSize:'16px',boxSizing:'border-box'}}
            />
          ))}
          <div style={{display:'flex',justifyContent:'space-between',margin:'16px 0'}}>
            <span style={{fontWeight:'bold',fontSize:'18px'}}>Total:</span>
            <span style={{color:'#f97316',fontWeight:'bold',fontSize:'24px'}}>{total.toFixed(2)}€</span>
          </div>
          <button onClick={handleCheckout} disabled={loading} style={{width:'100%',background:'#f97316',color:'white',border:'none',padding:'16px',borderRadius:'999px',fontWeight:'bold',fontSize:'18px',cursor:'pointer',opacity:loading?0.5:1}}>
            {loading ? 'Procesando...' : 'Pagar con SumUp'}
          </button>
          <button onClick={() => setStep('cart')} style={{width:'100%',marginTop:'12px',background:'none',border:'none',color:'#9ca3af',cursor:'pointer',fontSize:'14px'}}>
            ← Volver al carrito
          </button>
        </>
      )}
    </div>
  );
}
