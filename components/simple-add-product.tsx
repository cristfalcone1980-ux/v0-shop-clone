'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface SimpleAddProductProps {
  onProductAdded: () => void
}

export function SimpleAddProduct({ onProductAdded }: SimpleAddProductProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [affiliateLink, setAffiliateLink] = useState('')
  const [imageError, setImageError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (!name.trim() || !price.trim()) {
        throw new Error('Nombre y Precio requeridos')
      }

      const priceNum = parseFloat(price)
      if (isNaN(priceNum) || priceNum < 0) {
        throw new Error('Precio inválido')
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          // FIX: precio real del usuario
          price: priceNum,
          // FIX: imagen real del usuario
          image_url: imageUrl.trim(),
          amazon_affiliate_link: affiliateLink.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al agregar producto')
      }

      setMessage('✓ Producto agregado correctamente')
      setName('')
      setDescription('')
      setPrice('')
      setImageUrl('')
      setAffiliateLink('')
      setImageError(false)
      onProductAdded()
    } catch (err) {
      setMessage(
        `❌ ${err instanceof Error ? err.message : 'Error desconocido'}`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        Agregar Producto
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Nombre *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: iPhone 15 Pro"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción del producto"
            rows={2}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Precio (€) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="999.99"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            required
          />
        </div>

        {/* FIX: Campo de imagen con preview */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            URL de imagen
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value)
              setImageError(false)
            }}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          />
          {/* Preview de imagen en tiempo real */}
          {imageUrl && !imageError && (
            <div className="mt-2">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-md border border-border"
                onError={() => setImageError(true)}
              />
            </div>
          )}
          {imageUrl && imageError && (
            <p className="text-xs text-red-500 mt-1">
              No se puede cargar esta imagen. Verifica la URL.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Link de afiliado (opcional)
          </label>
          <input
            type="url"
            value={affiliateLink}
            onChange={(e) => setAffiliateLink(e.target.value)}
            placeholder="https://amazon.es/..."
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          />
        </div>

        <Button type="submit" disabled={loading || !name || !price} className="w-full">
          {loading ? 'Agregando...' : 'Agregar Producto'}
        </Button>

        {message && (
          <div
            className={`text-sm p-2 rounded ${
              message.includes('✓')
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  )
}
