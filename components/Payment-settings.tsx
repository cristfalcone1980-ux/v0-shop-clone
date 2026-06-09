'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface PaymentMethod {
  id: string
  type: 'paypal' | 'bizum' | 'bank_transfer' | 'stripe'
  label: string
  value: string
  enabled: boolean
}

interface PaymentSettingsProps {
  onClose: () => void
}

const PAYMENT_TYPES = [
  {
    type: 'paypal' as const,
    label: 'PayPal',
    placeholder: 'tu@email.com o https://paypal.me/tu-usuario',
    icon: '💳',
    description: 'Email de PayPal o enlace PayPal.me',
  },
  {
    type: 'bizum' as const,
    label: 'Bizum',
    placeholder: '+34 600 000 000',
    icon: '📱',
    description: 'Número de teléfono asociado a Bizum',
  },
  {
    type: 'bank_transfer' as const,
    label: 'Transferencia bancaria',
    placeholder: 'ES00 0000 0000 0000 0000 0000',
    icon: '🏦',
    description: 'IBAN de tu cuenta bancaria',
  },
  {
    type: 'stripe' as const,
    label: 'Stripe',
    placeholder: 'pk_live_...',
    icon: '⚡',
    description: 'Clave pública de Stripe',
  },
]

export default function PaymentSettings({ onClose }: PaymentSettingsProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const loadPaymentMethods = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)

      if (data && data.length > 0) {
        setMethods(data)
      } else {
        // Inicializar con métodos vacíos
        setMethods(
          PAYMENT_TYPES.map((pt) => ({
            id: pt.type,
            type: pt.type,
            label: pt.label,
            value: '',
            enabled: false,
          }))
        )
      }
    } catch (err) {
      // Tabla puede no existir aún, inicializar vacío
      setMethods(
        PAYMENT_TYPES.map((pt) => ({
          id: pt.type,
          type: pt.type,
          label: pt.label,
          value: '',
          enabled: false,
        }))
      )
    } finally {
      setLoading(false)
    }
  }

  const updateMethod = (type: string, field: 'value' | 'enabled', val: string | boolean) => {
    setMethods((prev) =>
      prev.map((m) => (m.type === type ? { ...m, [field]: val } : m))
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // Guardar cada método activo
      for (const method of methods) {
        if (method.enabled && !method.value.trim()) {
          throw new Error(`Completa el valor de ${method.label} o desactívalo`)
        }

        await supabase
          .from('payment_methods')
          .upsert({
            user_id: user.id,
            type: method.type,
            label: method.label,
            value: method.value.trim(),
            enabled: method.enabled,
          }, { onConflict: 'user_id,type' })
      }

      setSuccess('Métodos de pago guardados correctamente')
      setTimeout(() => onClose(), 1500)
    } catch (err: any) {
      setError(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-card rounded-lg p-8 text-foreground">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Métodos de pago</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <p className="text-sm text-muted-foreground">
            Activa los métodos de pago que quieres ofrecer en tu tienda. Solo se muestran los activados.
          </p>

          {PAYMENT_TYPES.map((pt) => {
            const method = methods.find((m) => m.type === pt.type)
            if (!method) return null

            return (
              <div
                key={pt.type}
                className={`border rounded-lg p-4 transition-colors ${
                  method.enabled ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{pt.icon}</span>
                    <div>
                      <p className="font-medium text-foreground text-sm">{pt.label}</p>
                      <p className="text-xs text-muted-foreground">{pt.description}</p>
                    </div>
                  </div>
                  {/* Toggle */}
                  <button
                    type="button"
                    onClick={() => updateMethod(pt.type, 'enabled', !method.enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      method.enabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        method.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {method.enabled && (
                  <input
                    type="text"
                    value={method.value}
                    onChange={(e) => updateMethod(pt.type, 'value', e.target.value)}
                    placeholder={pt.placeholder}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
              </div>
            )
          })}

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

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
