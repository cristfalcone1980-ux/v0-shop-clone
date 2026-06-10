'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import AddProductModal from '@/components/add-product-modal'
import ProductsList from '@/components/products-list'
import AffiliateSettings from '@/components/affiliate-settings'
import PaymentSettings from '@/components/payment-settings'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showPayments, setShowPayments] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
        loadProducts()
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const { data } = await response.json()
        setProducts(data || [])
      }
    } catch (err) {
      console.error('Error loading products:', err)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Dropbay Admin</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPayments(true)}>💳 Pagos</Button>
            <Button variant="outline" onClick={() => setShowSettings(true)}>Configuración</Button>
            <Button variant="outline" onClick={handleLogout}>Cerrar sesión</Button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Mis productos</h2>
            <p className="text-muted-foreground text-sm mt-1">{products.length} producto{products.length !== 1 ? 's' : ''}</p>
          </div>
          <Button onClick={() => setShowAddProduct(true)}>+ Agregar producto</Button>
        </div>
        <ProductsList products={products} onProductsChange={loadProducts} />
      </main>
      {showAddProduct && <AddProductModal onClose={() => setShowAddProduct(false)} onProductAdded={loadProducts} />}
      {showSettings && <AffiliateSettings onClose={() => setShowSettings(false)} />}
      {showPayments && <PaymentSettings onClose={() => setShowPayments(false)} />}
    </div>
  )
}
