'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  image_url: string
  amazon_affiliate_link: string
  amazon_asin: string
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [imageError, setImageError] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (params?.id) {
      loadProduct(params.id as string)
    }
  }, [params?.id])

  const loadProduct = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setProduct(data)
      }
    } catch (err) {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando producto...</p>
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Producto no encontrado</h1>
        <p className="text-muted-foreground">Este producto no existe o fue eliminado.</p>
        <Link href="/">
          <Button>Volver a la tienda</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Volver
          </button>
          <Link href="/" className="text-xl font-bold text-foreground">
            Dropbay
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-muted rounded-lg overflow-hidden aspect-square flex items-center justify-center">
            {product.image_url && !imageError ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="text-muted-foreground text-center p-8">
                <p className="text-4xl mb-2">📦</p>
                <p className="text-sm">Sin imagen</p>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-3">
                {product.name}
              </h1>
              {product.description && (
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {product.description}
                </p>
              )}
              <p className="text-3xl font-bold text-primary mb-6">
                {product.price?.toFixed(2)}€
              </p>
            </div>

            <div className="space-y-3">
              {product.amazon_affiliate_link && (
                <a
                  href={product.amazon_affiliate_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full" size="lg">
                    Comprar en Amazon
                  </Button>
                </a>
              )}
              <Link href="/">
                <Button variant="outline" className="w-full" size="lg">
                  Seguir comprando
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
