'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface AddProductModalProps {
  onClose: () => void
  onProductAdded: () => void
}

export default function AddProductModal({ onClose, onProductAdded }: AddProductModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [affiliateLink, setAffiliateLink] = useState('')
  const [imageError, setImageError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const priceNum = parseFloat(price)
      if (isNaN(priceNum) || priceNum < 0) throw new Error('Precio inválido')
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
      setName(''); setDescription(''); setPrice(''); setImageUrl(''); setAffiliateLink('')
      onProductAdded()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Agregar producto</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nombre *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nombre del producto" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Descripción del producto" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Precio (€) *</label>
            <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">URL de imagen</label>
            <input type="url" value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImageError(false) }}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://ejemplo.com/imagen.jpg" />
            {imageUrl && !imageError && (
              <img src={imageUrl} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg border border-border"
                onError={() => setImageError(true)} />
            )}
            {imageUrl && imageError && <p className="text-xs text-red-500 mt-1">URL de imagen no válida</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Link de afiliado</label>
            <input type="url" value={affiliateLink} onChange={(e) => setAffiliateLink(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://amazon.es/..." />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={loading || !name || !price} className="flex-1">
              {loading ? 'Agregando...' : 'Agregar producto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
