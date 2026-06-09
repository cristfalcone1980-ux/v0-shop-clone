'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface AddProductModalProps {
  onClose: () => void
  onProductAdded: () => void
}

export default function AddProductModal({
  onClose,
  onProductAdded,
}: AddProductModalProps) {
  const [tab, setTab] = useState<'manual' | 'amazon'>('manual')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Manual product state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [affiliateLink, setAffiliateLink] = useState('')
  const [imageError, setImageError] = useState(false)

  // Amazon search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  // Edición de precio antes de agregar desde Amazon
  const [editingPrice, setEditingPrice] = useState<{ [id: string]: string }>({})

  const supabase = createClient()

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!name.trim() || !price.trim()) {
        throw new Error('Nombre y Precio son requeridos')
      }

      const priceNum = parseFloat(price)
      if (isNaN(priceNum) || priceNum < 0) {
        throw new Error('Precio debe ser un número válido')
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          price: priceNum,
          image_url: imageUrl.trim(),
          amazon_affiliate_link: affiliateLink.trim(),
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Error al agregar producto')
      }

      setName('')
      setDescription('')
      setPrice('')
      setImageUrl('')
      setAffiliateLink('')
      onProductAdded()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // FIX: Búsqueda Amazon usando la API de productos existente en el backend
  // En lugar de datos simulados, hacemos fetch real al endpoint de búsqueda
  const handleAmazonSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    setError('')
    setSearchResults([])

    try {
      const res = await fetch(
        `/api/amazon/search?q=${encodeURIComponent(searchQuery)}`
      )

      if (!res.ok) {
        // Si no hay API de Amazon configurada, mostramos mensaje claro
        const data = await res.json().catch(() => ({}))
        throw new Error(
          data.error ||
            'La búsqueda de Amazon no está configurada. Usa el modo Manual o añade la URL de imagen directamente.'
        )
      }

      const data = await res.json()
      const results = (data.items || []).map((item: any) => ({
        id: item.asin || item.id,
        title: item.title,
        // FIX: precio real del producto, no hardcodeado
        price: item.price?.toString() || '',
        // FIX: imagen real del producto
        image: item.image_url || item.image || '',
        asin: item.asin,
      }))

      if (results.length === 0) {
        throw new Error('Sin resultados. Prueba con otro término de búsqueda.')
      }

      // Inicializar precios editables con valores reales
      const initialPrices: { [id: string]: string } = {}
      results.forEach((r: any) => {
        initialPrices[r.id] = r.price
      })
      setEditingPrice(initialPrices)
      setSearchResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la búsqueda')
    } finally {
      setSearching(false)
    }
  }

  const handleAddFromAmazon = async (result: any) => {
    setLoading(true)
    setError('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('No autenticado')

      const { error: settingsError, data: settings } = await supabase
        .from('affiliate_settings')
        .select('amazon_affiliate_id')
        .eq('user_id', user.id)
        .single()

      if (settingsError || !settings?.amazon_affiliate_id) {
        throw new Error('Configura tu ID de afiliado de Amazon primero en Configuración')
      }

      // FIX: usar precio editado por el usuario, no el hardcodeado
      const finalPrice = parseFloat(editingPrice[result.id] || result.price)
      if (isNaN(finalPrice) || finalPrice < 0) {
        throw new Error('El precio no es válido')
      }

      const affiliateLink = `https://amazon.es/gp/product/${result.asin}?tag=${settings.amazon_affiliate_id}`

      const { error: insertError } = await supabase
        .from('products')
        .insert([{
          name: result.title,
          // FIX: precio real y editable
          price: finalPrice,
          currency: 'EUR',
          // FIX: imagen real del producto
          image_url: result.image,
          amazon_asin: result.asin,
          amazon_affiliate_link: affiliateLink,
          user_id: user.id,
        }])

      if (insertError) throw insertError

      setSearchResults([])
      setSearchQuery('')
      onProductAdded()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Error al agregar producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Agregar producto</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-border">
            <button
              onClick={() => setTab('manual')}
              className={`pb-2 px-4 font-medium ${
                tab === 'manual'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Manual
            </button>
            <button
              onClick={() => setTab('amazon')}
              className={`pb-2 px-4 font-medium ${
                tab === 'amazon'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Desde Amazon
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* PESTAÑA MANUAL */}
          {tab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nombre *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nombre del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Descripción del producto"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Precio (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">URL de imagen</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value)
                    setImageError(false)
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com/imagen.jpg"
                />
                {/* FIX: Preview de imagen en tiempo real */}
                {imageUrl && !imageError && (
                  <div className="mt-2">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg border border-border"
                      onError={() => setImageError(true)}
                    />
                  </div>
                )}
                {imageUrl && imageError && (
                  <p className="text-xs text-red-500 mt-1">
                    No se puede cargar la imagen. Verifica la URL.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Link de afiliado</label>
                <input
                  type="url"
                  value={affiliateLink}
                  onChange={(e) => setAffiliateLink(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://amazon.es/..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || !name || !price} className="flex-1">
                  {loading ? 'Agregando...' : 'Agregar producto'}
                </Button>
              </div>
            </form>
          )}

          {/* PESTAÑA AMAZON */}
          {tab === 'amazon' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Busca un producto en Amazon y agrégalo directamente con tu enlace de afiliado.
              </p>

              <form onSubmit={handleAmazonSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar producto en Amazon..."
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button type="submit" disabled={searching || !searchQuery}>
                  {searching ? 'Buscando...' : 'Buscar'}
                </Button>
              </form>

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center gap-4 p-3 border border-border rounded-lg hover:bg-muted/50"
                    >
                      {/* FIX: Imagen real con fallback */}
                      <div className="w-16 h-16 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                        {result.image ? (
                          <img
                            src={result.image}
                            alt={result.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="%23ccc"%3E%3Crect width="64" height="64"/%3E%3Ctext x="32" y="36" text-anchor="middle" font-size="10" fill="%23888"%3ENo img%3C/text%3E%3C/svg%3E'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            Sin imagen
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {result.title}
                        </p>
                        {/* FIX: Precio editable por el usuario */}
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-muted-foreground">€</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editingPrice[result.id] ?? result.price}
                            onChange={(e) =>
                              setEditingPrice((prev) => ({
                                ...prev,
                                [result.id]: e.target.value,
                              }))
                            }
                            className="w-20 px-1 py-0.5 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-primary font-semibold"
                          />
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleAddFromAmazon(result)}
                        disabled={loading}
                      >
                        {loading ? '...' : 'Agregar'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.length === 0 && !searching && !error && (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  Escribe un producto y pulsa Buscar
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

          
      
