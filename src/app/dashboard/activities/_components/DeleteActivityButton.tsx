'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function DeleteActivityButton({
  activityId,
}: {
  activityId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this activity?')) return
    setLoading(true)
    try {
      await fetch(`/api/activities/${activityId}`, { method: 'DELETE' })
      toast.success(`Activity deleted successfully`)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={loading}
      className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </Button>
  )
}
