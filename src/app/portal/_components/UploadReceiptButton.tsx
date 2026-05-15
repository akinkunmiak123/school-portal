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
import {
  Upload,
  Loader2,
  CheckCircle,
  FileImage,
  FileText,
  AlertCircle,
} from 'lucide-react'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

export default function UploadReceiptButton({ termId }: { termId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    setError('')
    setFile(null)

    if (!selected) return

    const isImage = selected.type.startsWith('image/')
    const isPDF = selected.type === 'application/pdf'

    if (!isImage && !isPDF) {
      setError('Only image files (JPG, PNG, etc.) or PDF files are allowed.')
      e.target.value = ''
      return
    }

    if (selected.size > MAX_FILE_SIZE) {
      setError(
        `File is too large (${(selected.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 2MB. Please compress your file and try again.`
      )
      e.target.value = ''
      return
    }

    setFile(selected)
  }

  const handleSubmit = async () => {
    if (!file) return setError('Please select a file')

    setUploading(true)
    setError('')
    setProgress(0)

    try {
      // Step 1 — Upload file to Supabase via our API
      setProgress(30)
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.error)

      setProgress(70)

      // Step 2 — Save payment record
      const paymentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptUrl: uploadData.url,
          termId,
        }),
      })

      const paymentData = await paymentRes.json()
      if (!paymentRes.ok) throw new Error(paymentData.error)

      setProgress(100)
      setDone(true)

      setTimeout(() => {
        setOpen(false)
        setDone(false)
        setFile(null)
        setProgress(0)
        router.refresh()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Upload failed — please try again')
    } finally {
      setUploading(false)
    }
  }

  const handleOpenChange = (val: boolean) => {
    if (uploading) return // prevent closing while uploading
    setOpen(val)
    if (!val) {
      setFile(null)
      setError('')
      setDone(false)
      setProgress(0)
    }
  }

  const fileSizeMB = file ? (file.size / (1024 * 1024)).toFixed(1) : null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Receipt
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Fee Receipt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {done ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <CheckCircle className="w-14 h-14 text-green-600" />
              <p className="font-bold text-green-700 text-lg">
                Receipt Submitted!
              </p>
              <p className="text-sm text-gray-500 text-center">
                Your receipt has been sent to the admin for review. You will
                get access to your results once approved.
              </p>
            </div>
          ) : (
            <>
              {/* Info banner */}
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Upload your school fee payment receipt
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                    <FileImage className="w-3.5 h-3.5" />
                    JPG, PNG, WEBP
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                    <FileText className="w-3.5 h-3.5" />
                    PDF
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-orange-600 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Max 2MB
                  </div>
                </div>
              </div>

              {/* File picker */}
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer disabled:opacity-50"
              />

              {/* File preview */}
              {file && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 px-3 py-2 rounded-lg">
                  {file.type === 'application/pdf' ? (
                    <FileText className="w-4 h-4 text-red-500 shrink-0" />
                  ) : (
                    <FileImage className="w-4 h-4 text-blue-500 shrink-0" />
                  )}
                  <span className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1">
                    {file.name}
                  </span>
                  <span className="text-xs text-green-600 font-semibold shrink-0">
                    {fileSizeMB}MB ✓
                  </span>
                </div>
              )}

              {/* Progress bar */}
              {uploading && (
                <div className="space-y-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {progress < 50
                      ? 'Uploading file...'
                      : progress < 90
                      ? 'Saving receipt...'
                      : 'Almost done...'}
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={uploading || !file}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Submit Receipt
                    </>
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