'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Loader2, CheckCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function SessionTermPanel({ school }: { school: any }) {
  const router = useRouter()
  const [newSession, setNewSession] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')

  const createSession = async () => {
    if (!newSession.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSession, schoolId: school.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNewSession('')
    toast.success(`New Session Added`)
      router.refresh()
    } catch (err: any) {
      toast.error('Failed to add session')
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const setCurrentTerm = async (termId: string, sessionId: string) => {
    setLoading(true)
    try {
      await fetch('/api/sessions/current', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termId, sessionId }),
      })
      toast.success(`Session updated`)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const deleteSession = async (sessionId: string) => {
    setLoading(true)
    setDeleteError('')
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDeleteOpen(null)
      toast.success(`Session deleted`)
      router.refresh()
    } catch (err: any) {
      toast.error('Failed to delete session')
      setDeleteError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Sessions & Terms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create new session */}
        <div className="space-y-2">
          <Label>Create New Session</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. 2025/2026"
              value={newSession}
              onChange={(e) => setNewSession(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createSession()}
            />
            <Button
              onClick={createSession}
              disabled={loading || !newSession.trim()}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Sessions list */}
        <div className="space-y-4">
          {school.sessions.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              No sessions yet. Create one above.
            </p>
          )}
          {school.sessions.map((session: any) => (
            <div
              key={session.id}
              className="border rounded-lg p-4 dark:border-gray-700"
            >
              {/* Session header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {session.name}
                  </p>
                  {session.isCurrent && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Current
                    </Badge>
                  )}
                </div>

                {/* Delete session button — only for non-current */}
                {!session.isCurrent && (
                  <Dialog
                    open={deleteOpen === session.id}
                    onOpenChange={(open) => {
                      setDeleteOpen(open ? session.id : null)
                      setDeleteError('')
                    }}
                  >
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
                        <DialogTitle>Delete Session</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete{' '}
                        <strong>{session.name}</strong>? This will permanently
                        delete all terms and results under this session. This
                        cannot be undone.
                      </p>
                      {deleteError && (
                        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                          {deleteError}
                        </p>
                      )}
                      <div className="flex gap-2 justify-end mt-2">
                        <Button
                          variant="outline"
                          onClick={() => setDeleteOpen(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => deleteSession(session.id)}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            'Delete Session'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {/* Terms */}
              <div className="space-y-2">
                {['First Term', 'Second Term', 'Third Term'].map((termName) => {
                  const term = session.terms.find(
                    (t: any) => t.name === termName,
                  )
                  const isCurrentTerm = term?.isCurrent
                  return (
                    <div
                      key={termName}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-900"
                    >
                      <div className="flex items-center gap-2">
                        {isCurrentTerm && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        <span className="text-sm text-gray-800 dark:text-gray-200">
                          {termName}
                        </span>
                        {isCurrentTerm && (
                          <Badge className="text-xs bg-green-100 text-green-700">
                            Active
                          </Badge>
                        )}
                      </div>
                      {!isCurrentTerm && term && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentTerm(term.id, session.id)}
                          disabled={loading}
                        >
                          Set Active
                        </Button>
                      )}
                      {!term && (
                        <span className="text-xs text-gray-400">
                          Not created
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
