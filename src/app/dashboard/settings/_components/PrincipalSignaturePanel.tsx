'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Loader2, CheckCircle, Pen } from 'lucide-react'

export default function PrincipalSignaturePanel({
  currentSignature,
  currentName,
}: {
  currentSignature?: string | null
  currentName?: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [name, setName] = useState(currentName || '')
  const [preview, setPreview] = useState<string | null>(
    currentSignature ?? null,
  )
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    setError('')
    if (!selected) return
    if (selected.size > 1 * 1024 * 1024) {
      setError('File too large. Max 1MB.')
      return
    }
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      if (file) formData.append('file', file)
      formData.append('principalName', name)

      const res = await fetch('/api/school/principal', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        router.refresh()
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pen className="w-5 h-5 text-purple-600" />
          Principal Signature
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Principal Name</Label>
          <Input
            placeholder="e.g. Mr. John Adeyemi"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Signature Image (PNG/JPG, max 1MB)</Label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
        </div>

        {preview && (
          <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
            <p className="text-xs text-gray-500 mb-2">Preview:</p>
            <img
              src={preview}
              alt="Principal signature"
              className="h-16 object-contain"
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
            {error}
          </p>
        )}

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : success ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Saved!
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Save Principal Signature
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
