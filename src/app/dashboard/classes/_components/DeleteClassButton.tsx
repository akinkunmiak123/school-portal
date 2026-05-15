'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function DeleteClassButton({
  classId,
  className,
}: {
  classId: string
  className: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

 const handleDelete = async () => {
   setLoading(true)
   try {
     const res = await fetch(`/api/classes/${classId}`, {
       method: 'DELETE',
     })

     if (!res.ok) throw new Error('Failed to delete')

     toast.success(`"${className}" deleted`)

     setOpen(false)
     router.refresh()
   } catch (err) {
     toast.error('Failed to delete class')
   } finally {
     setLoading(false)
   }
 }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-400 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Class</DialogTitle>
        </DialogHeader>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Are you sure you want to delete <strong>{className}</strong>? This
          will also remove all students, subjects and results in this class.
          This action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Class'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
