'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface AffiliateSettingsProps {
  onClose: () => void
}

export default function AffiliateSettings({ onClose }: AffiliateSettingsProps) {
  const [amazonAffiliateId, setAmazonAffiliateId] = useState('')
  const [simupApiKey, setSimupApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('affiliate_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (data) {
          setAmazonAffiliateId(data.amazon_affiliate_id || '')
          setSimupApiKey(data.simup_api_key || '')
        }
      }
    } catch (err) {
      console.log('[v0] Settings not found, starting fresh')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('No authenticated')

      const { error: upsertError } = await supabase
        .from('affiliate_settings')
        .upsert({
          user_id: user.id,
          amazon_affiliate_id: amazonAffiliateId,
          simup_api_key: simupApiKey,
        })

      if (upsertError) throw upsertError

      setSuccess('Configuración guardada correctamente')
      setTimeout(() => onClose(), 1500)
    } catch (err) {
      setError(err.message || 'Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-card rounded-lg p-8">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Configuración
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              ID de Afiliado de Amazon
            </label>
            <input
              type="text"
              value={amazonAffiliateId}
              onChange={(e) => setAmazonAffiliateId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="tu-id-afiliado"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tu ID único de afiliado de Amazon (ej: dropbay-21)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Clave API de Simup
            </label>
            <input
              type="password"
              value={simupApiKey}
              onChange={(e) => setSimupApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="tu-clave-api"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tu clave de API de Simup para procesar pagos
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

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
              disabled={saving || !amazonAffiliateId}
              className="flex-1"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
