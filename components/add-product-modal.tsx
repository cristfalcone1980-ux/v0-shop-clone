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

  // Amazon search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const supabase = createClient()

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('No authenticated')

      console.log('[v0] User ID:', user.id)
      console.log('[v0] Product data:', { name, price: parseFloat(price), imageUrl, affiliateLink })

      const { error: insertError } = await supabase
        .from('products')
        .insert([{
          name,
          description,
          price: parseFloat(price),
          currency: 'EUR',
          image_url: imageUrl,
          amazon_affiliate_link: affiliateLink,
          user_id: user.id,
        }])

      if (insertError) {
        console.log('[v0] Insert error:', insertError)
        throw insertError
      }

      console.log('[v0] Product added successfully')
      setName('')
      setDescription('')
      setPrice('')
      setImageUrl('')
      setAffiliateLink('')
      onProductAdded()
      onClose()
    } catch (err) {
      setError(err.message || 'Error al agregar producto')
    } finally {
      setLoading(false)
    }
  }

  const handleAmazonSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    setError('')

    try {
      // Simular búsqueda de Amazon (aquí iría la API real de Amazon)
      // Por ahora devolvemos resultados simulados
      const mockResults = [
        {
          id: '1',
          title: `"${searchQuery}" - Producto 1`,
          price: '29.99',
          image: 'https://via.placeholder.com/200?text=Product+1',
          asin: 'B001',
        },
        {
          id: '2',
          title: `"${searchQuery}" - Producto 2`,
          price: '39.99',
          image: 'https://via.placeholder.com/200?text=Product+2',
          asin: 'B002',
        },
      ]
      setSearchResults(mockResults)
    } catch (err) {
      setError('Error en la búsqueda')
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

      if (!user) throw new Error('No authenticated')

      const { error: settingsError, data: settings } = await supabase
        .from('affiliate_settings')
        .select('amazon_affiliate_id')
        .eq('user_id', user.id)
        .single()

      if (settingsError) {
        throw new Error('Configura tu ID de afiliado primero')
      }

      const affiliateLink = `https://amazon.es/gp/product/${result.asin}?tag=${settings.amazon_affiliate_id}`

      const { error: insertError } = await supabase
        .from('products')
        .insert({
          name: result.title,
          price: parseFloat(result.price),
          currency: 'EUR',
          image_url: result.image,
          amazon_asin: result.asin,
          amazon_affiliate_link: affiliateLink,
          user_id: user.id,
        })

      if (insertError) throw insertError

      setSearchResults([])
      setSearchQuery('')
      onProductAdded()
      onClose()
    } catch (err) {
      setError(err.message || 'Error al agregar producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Agregar producto</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
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

          {tab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Nombre
                </label>
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
                <label className="block text-sm font-medium text-foreground mb-1">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Descripción del producto"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Precio (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  URL de imagen
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Link de afiliado
                </label>
                <input
                  type="url"
                  value={affiliateLink}
                  onChange={(e) => setAffiliateLink(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://amazon.es/..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !name || !price}
                  className="flex-1"
                >
                  {loading ? 'Agregando...' : 'Agregar'}
                </Button>
              </div>
            </form>
          )}

          {tab === 'amazon' && (
            <div className="space-y-4">
              <form onSubmit={handleAmazonSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar en Amazon..."
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  type="submit"
                  disabled={searching || !searchQuery}
                >
                  {searching ? 'Buscando...' : 'Buscar'}
                </Button>
              </form>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center gap-4 p-3 border border-border rounded-lg hover:bg-muted/50"
                    >
                      <img
                        src={result.image}
                        alt={result.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">
                          {result.title}
                        </p>
                        <p className="text-primary font-semibold">
                          {result.price}€
                        </p>
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

              {searchResults.length === 0 && !searching && searchQuery && (
                <div className="text-center text-muted-foreground py-8">
                  Sin resultados
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
