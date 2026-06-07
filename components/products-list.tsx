'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface ProductsListProps {
  products: any[]
  onProductsChange: () => void
}

export default function ProductsList({
  products,
  onProductsChange,
}: ProductsListProps) {
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

  if (products.length === 0) {
    return (
      <div className="text-center py-12 border border-border rounded-lg bg-muted/30">
        <p className="text-muted-foreground mb-4">No tienes productos aún</p>
        <p className="text-sm text-muted-foreground">
          Comienza agregando un producto desde Amazon o manualmente
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-card"
        >
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {product.description}
            </p>
            <p className="text-lg font-bold text-primary mb-4">
              {product.price}€
            </p>
            <div className="flex gap-2">
              {product.amazon_affiliate_link && (
                <a
                  href={product.amazon_affiliate_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full text-xs">
                    Ver en Amazon
                  </Button>
                </a>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(product.id)}
                className="flex-1"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
