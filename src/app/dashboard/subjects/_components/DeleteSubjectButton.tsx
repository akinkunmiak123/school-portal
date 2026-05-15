'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function DeleteSubjectButton({
  subjectId,
  subjectName,
}: {
  subjectId: string
  subjectName: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Remove "${subjectName}"?`)) return
    setLoading(true)
    try {
      await fetch(`/api/subjects/${subjectId}`, { method: 'DELETE' })
      toast.success(`Subject deleted successfully`)
      router.refresh()
    } catch (err) {
       toast.error('Failed to delete subject')
      console.error(err)
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
      className="text-red-400 hover:text-red-600 hover:bg-red-50 h-7 w-7"
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Trash2 className="w-3 h-3" />
      )}
    </Button>
  )
}
