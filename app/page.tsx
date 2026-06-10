'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  amazon_affiliate_link: string
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([])
  const [showCart, setShowCart] = useState(false)
  const [search, setSearch] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      setProducts(data || [])
    } catch (err) {
      console.error('Error loading products:', err)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Drop<span className="text-[#f97316]">bay</span>
          </Link>

          {/* Buscador */}
          <div className="flex-1 max-w-md hidden md:block">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#f97316]"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition text-sm"
            >
              🛒
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#f97316] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
            <Link href="/auth/login">
              <button className="px-4 py-2 rounded-full border border-white/20 text-sm hover:bg-white/10 transition">
                Admin
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-24 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f97316]/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#f97316]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-[#f97316]/20 text-[#f97316] text-xs font-semibold rounded-full mb-4 tracking-wider uppercase">
              Tecnología & más
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
              Los mejores productos,<br />
              <span className="text-[#f97316]">al mejor precio</span>
            </h1>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Descubre nuestra selección de tecnología, gadgets y mucho más. 
              Envío directo desde Amazon con garantía.
            </p>
            <div className="flex gap-3">
              <a href="#productos">
                <button className="px-6 py-3 bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold rounded-full transition">
                  Ver productos
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="py-8 px-4 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {['Todo', 'Móviles', 'Audio', 'Informática', 'Hogar', 'Accesorios', 'Ofertas'].map((cat) => (
              <button
                key={cat}
                className="flex-shrink-0 px-4 py-2 rounded-full border border-white/20 text-sm text-white/70 hover:border-[#f97316] hover:text-[#f97316] transition"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* BUSCADOR MÓVIL */}
      <div className="px-4 py-4 md:hidden">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#f97316]"
        />
      </div>

      {/* PRODUCTOS */}
      <section id="productos" className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">
              {search ? `Resultados para "${search}"` : 'Productos destacados'}
            </h2>
            <span className="text-white/40 text-sm">{filteredProducts.length} productos</span>
          </div>

          {loading ? (
            <div className="text-center py-20 text-white/40">Cargando productos...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              <p className="text-4xl mb-4">🔍</p>
              <p>No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#f97316]/50 hover:bg-white/8 transition-all duration-300"
                >
                  <div className="relative overflow-hidden aspect-square bg-white/5">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = ''
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-white/20">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-white/40 text-xs mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[#f97316] font-bold text-lg">
                        {product.price?.toFixed(2)}€
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => addToCart(product)}
                        className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition"
                      >
                        + Carrito
                      </button>
                      {product.amazon_affiliate_link && (
                        <a
                          href={product.amazon_affiliate_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <button className="w-full py-2 rounded-xl bg-[#f97316] hover:bg-[#ea6c0a] text-sm font-semibold transition">
                            Amazon
                          </button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-10 px-4 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-2xl font-bold">Drop<span className="text-[#f97316]">bay</span></p>
            <p className="text-white/40 text-sm mt-1">Tecnología y más al mejor precio</p>
          </div>
          <p className="text-white/30 text-xs">
            © 2025 Dropbay. Afiliado de Amazon.
          </p>
        </div>
      </footer>

      {/* CARRITO */}
      {showCart && (
        <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#111] border-l border-white/10 shadow-2xl z-50 overflow-y-auto">
          <div className="sticky top-0 bg-[#111] border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Carrito</h2>
            <button onClick={() => setShowCart(false)} className="text-white/40 hover:text-white">✕</button>
          </div>
          <div className="p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <p className="text-4xl mb-3">🛒</p>
                <p>Tu carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 pb-4 border-b border-white/10">
                    {item.product.image_url && (
                      <img src={item.product.image_url} alt={item.product.name} className="w-12 h-12 object-cover rounded-lg" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                      <p className="text-[#f97316] text-sm font-semibold">{item.product.price}€ x {item.quantity}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-white/30 hover:text-white">✕</button>
                  </div>
                ))}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-[#f97316]">{cartTotal.toFixed(2)}€</span>
                  </div>
                  <button className="w-full py-3 bg-[#f97316] hover:bg-[#ea6c0a] rounded-xl font-semibold transition">
                    Finalizar compra
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
