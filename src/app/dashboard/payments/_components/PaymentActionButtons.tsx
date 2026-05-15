'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function PaymentActionButtons({
  paymentId,
}: {
  paymentId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
    setLoading(status === 'APPROVED' ? 'approve' : 'reject')
    try {
      await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white h-8"
        onClick={() => handleAction('APPROVED')}
        disabled={!!loading}
      >
        {loading === 'approve' ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <>
            <CheckCircle className="w-3 h-3 mr-1" />
            Approve
          </>
        )}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        className="h-8"
        onClick={() => handleAction('REJECTED')}
        disabled={!!loading}
      >
        {loading === 'reject' ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <>
            <XCircle className="w-3 h-3 mr-1" />
            Reject
          </>
        )}
      </Button>
    </div>
  )
}
