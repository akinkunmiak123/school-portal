'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Loader2, CheckCircle, Pen } from 'lucide-react'

export default function SignatureUpload({
  currentSignature,
}: {
  currentSignature?: string | null
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [preview, setPreview] = useState<string | null>(
    currentSignature ?? null,
  )

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 1 * 1024 * 1024) {
      setError('File too large. Max 1MB.')
      return
    }

    setUploading(true)
    setError('')
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/teacher/signature', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setPreview(data.signatureUrl)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left — icon + text */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center shrink-0">
              <Pen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Your Signature
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {preview
                  ? 'Signature uploaded — will appear on report cards'
                  : 'Upload your signature for report cards (PNG/JPG, max 1MB)'}
              </p>
            </div>
          </div>

          {/* Right — preview + upload button */}
          <div className="flex items-center gap-3 pl-[52px] sm:pl-0">
            {preview && (
              <img
                src={preview}
                alt="Your signature"
                className="h-10 object-contain border border-blue-200 rounded bg-white px-2 max-w-[120px]"
              />
            )}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900"
                disabled={uploading}
                asChild
              >
                <span>
                  {uploading ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Uploading...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Upload className="w-3 h-3 mr-1" />
                      {preview ? 'Update' : 'Upload'}
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </CardContent>
    </Card>
  )
}
