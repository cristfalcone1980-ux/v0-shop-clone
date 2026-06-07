'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Cuenta creada
          </h1>
          <p className="text-muted-foreground mb-6">
            Revisa tu email para confirmar tu cuenta. Después podrás iniciar sesión.
          </p>
          <Link href="/auth/login">
            <Button className="w-full">
              Ir a login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
