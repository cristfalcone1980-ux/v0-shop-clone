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
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'white',fontFamily:'sans-serif'}}>
      <header style={{background:'#111',borderBottom:'1px solid #222',padding:'16px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:40}}>
        <h1 style={{fontSize:'24px',fontWeight:'bold',margin:0}}>Drop<span style={{color:'#f97316'}}>bay</span></h1>
        <button onClick={() => setShowCart(!showCart)} style={{background:'#222',border:'none',color:'white',padding:'12px',borderRadius:'50%',cursor:'pointer',position:'relative',fontSize:'18px'}}>
          🛒
          {cartItems.length > 0 && (
            <span style={{position:'absolute',top:'-4px',right:'-4px',background:'#f97316',color:'white',fontSize:'11px',borderRadius:'50%',width:'20px',height:'20px',display:'flex',alignItems:'center',justifyContent:'center'}}>{cartItems.length}</span>
          )}
        </button>
      </header>

      {showCart ? (
        <div style={{maxWidth:'500px',margin:'0 auto',padding:'32px 16px'}}>
          <CartSidebar items={cartItems} products={products} onRemove={removeFromCart} onUpdateQuantity={updateQuantity} onClose={() => setShowCart(false)} />
        </div>
      ) : (
        <>
          <div style={{background:'linear-gradient(to bottom, #1a0a00, #0a0a0a)',padding:'64px 24px'}}>
            <span style={{background:'rgba(249,115,22,0.2)',color:'#f97316',fontSize:'12px',fontWeight:'bold',padding:'4px 12px',borderRadius:'999px'}}>TECNOLOGÍA & MÁS</span>
            <h2 style={{fontSize:'48px',fontWeight:'900',margin:'16px 0 8px',lineHeight:1.1}}>Los mejores<br/>productos,<br/><span style={{color:'#f97316'}}>al mejor<br/>precio</span></h2>
            <p style={{color:'#9ca3af',margin:'16px 0 32px'}}>Descubre nuestra selección de tecnología, gadgets y mucho más.</p>
            <input type="text" placeholder="Buscar productos..." value={search} onChange={(e) => setSearch(e.target.value)} style={{width:'100%',background:'#1f1f1f',border:'none',color:'white',padding:'12px 16px',borderRadius:'999px',fontSize:'16px',outline:'none',boxSizing:'border-box'}} />
          </div>

          <div style={{padding:'32px 16px'}}>
            <h3 style={{fontSize:'20px',fontWeight:'bold',marginBottom:'24px'}}>Productos destacados <span style={{color:'#6b7280',fontSize:'14px',fontWeight:'normal'}}>{filtered.length} productos</span></h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'24px'}}>
              {filtered.map((product) => (
                <div key={product.id} style={{background:'#111',borderRadius:'12px',overflow:'hidden',border:'1px solid #222'}}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} style={{width:'100%',height:'200px',objectFit:'cover'}} />
                  ) : (
                    <div style={{width:'100%',height:'200px',background:'#1f1f1f',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'48px'}}>📦</div>
                  )}
                  <div style={{padding:'16px'}}>
                    <h4 style={{margin:'0 0 8px',fontWeight:'500'}}>{product.name}</h4>
                    <p style={{color:'#f97316',fontWeight:'bold',fontSize:'20px',margin:'0 0 16px'}}>{product.price}€</p>
                    {product.product_type === 'dropshipping' && product.amazon_affiliate_link ? (
                      <a href={product.amazon_affiliate_link} target="_blank" rel="noopener noreferrer" style={{display:'block',width:'100%',background:'#f97316',color:'white',padding:'10px',borderRadius:'8px',textAlign:'center',textDecoration:'none',fontWeight:'500',boxSizing:'border-box'}}>+ Información</a>
                    ) : (
                      <button onClick={() => addToCart(product.id)} style={{width:'100%',background:'#f97316',color:'white',border:'none',padding:'10px',borderRadius:'8px',cursor:'pointer',fontWeight:'500',fontSize:'16px'}}>Añadir al carrito</button>
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
