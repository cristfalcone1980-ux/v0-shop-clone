'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface SimpleAddProductProps {
  onProductAdded: () => void
}

export function SimpleAddProduct({ onProductAdded }: SimpleAddProductProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
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
      if (isNaN(priceNum)) {
        throw new Error('Precio inválido')
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: '',
          price: priceNum,
          image_url: '',
          amazon_affiliate_link: '',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al agregar producto')
      }

      setMessage('✓ Producto agregado')
      setName('')
      setPrice('')
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
            Nombre
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
            Precio (€)
          </label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="999.99"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            required
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
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
