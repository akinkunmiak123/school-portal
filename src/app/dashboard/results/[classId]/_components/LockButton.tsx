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
import { Lock, Unlock, Loader2 } from 'lucide-react'

export default function LockButton({
  classId,
  termId,
  isLocked,
}: {
  classId: string
  termId: string
  isLocked: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      await fetch('/api/results/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, termId, lock: !isLocked }),
      })
      setOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isLocked ? 'outline' : 'destructive'}
          size="sm"
          className={
            isLocked ? 'border-green-300 text-green-700 hover:bg-green-50' : ''
          }
        >
          {isLocked ? (
            <>
              <Unlock className="w-4 h-4 mr-2" />
              Unlock Scores
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Lock Scores
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isLocked ? 'Unlock Scores?' : 'Lock Scores?'}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isLocked
            ? 'Unlocking will allow teachers to edit scores again for this term.'
            : 'Locking will prevent any further edits to scores for this term. Students will be able to view their results.'}
        </p>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={isLocked ? 'default' : 'destructive'}
            onClick={handleToggle}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isLocked ? (
              'Yes, Unlock'
            ) : (
              'Yes, Lock Scores'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
