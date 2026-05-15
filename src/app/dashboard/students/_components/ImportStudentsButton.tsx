'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, Loader2, Download, CheckCircle } from 'lucide-react'

type Class = { id: string; name: string }

export default function ImportStudentsButton({
  schoolId,
  classes,
}: {
  schoolId: string
  classes: Class[]
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [classId, setClassId] = useState('')
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<any[]>([])
  const [result, setResult] = useState<{
    imported: number
    skipped: number
  } | null>(null)

  const resetState = () => {
    setClassId('')
    setError('')
    setPreview([])
    setResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) resetState()
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setResult(null)
    setError('')

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const rows = text.trim().split('\n').slice(1)
      const parsed = rows
        .filter((r) => r.trim())
        .map((row) => {
          const [firstName, lastName, email] = row
            .split(',')
            .map((v) => v.trim())
          return { firstName, lastName, email }
        })
      setPreview(parsed.slice(0, 3))
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!classId) return setError('Please select a class')
    if (!fileRef.current?.files?.[0]) return setError('Please select a file')

    setLoading(true)
    setError('')

    const file = fileRef.current.files[0]
    const text = await file.text()
    const rows = text.trim().split('\n').slice(1)
    const students = rows
      .filter((r) => r.trim())
      .map((row) => {
        const [firstName, lastName, email] = row.split(',').map((v) => v.trim())
        return { firstName, lastName, email, classId, schoolId }
      })

    try {
      const res = await fetch('/api/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setResult({ imported: data.imported, skipped: data.skipped ?? 0 })
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const csv =
      'firstName,lastName,email\nChidi,Okafor,chidi@email.com\nAmaka,Eze,amaka@email.com\n'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Students from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Template download */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Download CSV template
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                Columns: firstName, lastName, email
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="w-3 h-3 mr-1" />
              Template
            </Button>
          </div>

          {/* Result feedback */}
          {result && (
            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Import complete!
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {result.imported} imported
                  {result.skipped > 0 &&
                    `, ${result.skipped} skipped (duplicate emails)`}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                onClick={() => {
                  resetState()
                }}
              >
                Import More
              </Button>
            </div>
          )}

          {!result && (
            <>
              <div className="space-y-2">
                <Label>Assign all imported students to</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>CSV File</Label>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFile}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {preview.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-2">
                    Preview (first {preview.length} rows):
                  </p>
                  {preview.map((s, i) => (
                    <p
                      key={i}
                      className="text-xs text-gray-700 dark:text-gray-300"
                    >
                      {s.firstName} {s.lastName} — {s.email}
                    </p>
                  ))}
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                  {error}
                </p>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    'Import Students'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
