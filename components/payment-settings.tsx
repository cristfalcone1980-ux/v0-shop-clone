'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface PaymentMethod {
  id: string
  type: 'paypal' | 'bizum' | 'bank_transfer' | 'sumup'
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
    type: 'sumup' as const,
    label: 'SumUp',
    placeholder: 'Tu API Key de SumUp',
    icon: '💰',
    description: 'Pago con tarjeta mediante SumUp',
  },
]
