'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  amazon_affiliate_link: string
  product_type: string
}

interface ProductsListProps {
  products: Product[]
  onProductsChange: () => void
}

export default function ProductsList({ products, onProductsChange }: ProductsListProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [imageError, setImageError] = useState(false)
  const supabase = createClient()

  const handleDelete = async (productId: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await supabase.from('products').delete().eq('id', productId)
      onProductsChange()
    } catch (err) {
      alert('Error al eliminar producto')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product })
    setImageError(false)
  }

  const handleSave = async () => {
    if (!editingProduct) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          description: editingProduct.description,
          price: parseFloat(editingProduct.price.toString()),
          image_url: editingProduct.image_url,
          amazon_affiliate_link: editingProduct.amazon_affiliate_link,
          product_type: editingProduct.product_type,
        })
        .eq('id', editingProduct.id)

      if (error) throw error
      setEditingProduct(null)
      onProductsChange()
    } catch (err) {
      alert('Error al guardar producto')
    } finally {
      setSaving(false)
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 border border-border rounded-lg bg-muted/30">
        <p className="text-muted-foreground mb-4">No tienes productos aún</p>
        <p className="text-sm text-muted-foreground">Comienza agregando un producto</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-card">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            ) : (
              <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground">Sin imagen</div>
            )}
            <div className="p-4">
              {/* Badge tipo producto */}
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${
                product.product_type === 'propio' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {product.product_type === 'propio' ? '📦 Propio' : '🔗 Dropshipping'}
              </span>
              <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
              <p className="text-lg font-bold text-primary mb-4">{product.price}€</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(product)}>
                  ✏️ Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                  🗑️
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal editar */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Editar producto</h2>
              <button onClick={() => setEditingProduct(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="p-6 space-y-4">

              {/* Tipo de producto */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tipo de producto</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, product_type: 'dropshipping' })}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition ${
                      editingProduct.product_type === 'dropshipping' || !editingProduct.product_type
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    🔗 Dropshipping
                    <p className="text-xs font-normal mt-1 opacity-70">Redirige a tienda afiliada</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, product_type: 'propio' })}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition ${
                      editingProduct.product_type === 'propio'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    📦 Propio
                    <p className="text-xs font-normal mt-1 opacity-70">Vendes y envías tú</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
                <input type="text" value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
                <textarea value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Precio (€)</label>
                <input type="number" step="0.01" value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">URL de imagen</label>
                <input type="url" value={editingProduct.image_url || ''}
                  onChange={(e) => { setEditingProduct({ ...editingProduct, image_url: e.target.value }); setImageError(false) }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                {editingProduct.image_url && !imageError && (
                  <img src={editingProduct.image_url} alt="Preview"
                    className="mt-2 w-20 h-20 object-cover rounded-lg border border-border"
                    onError={() => setImageError(true)} />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {editingProduct.product_type === 'propio' ? 'Link externo (opcional)' : 'Link de afiliado'}
                </label>
                <input type="url" value={editingProduct.amazon_affiliate_link || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, amazon_affiliate_link: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://..." />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingProduct(null)} className="flex-1">Cancelar</Button>
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
