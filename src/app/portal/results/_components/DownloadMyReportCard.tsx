'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2, FileText } from 'lucide-react'

export default function DownloadMyReportCard({
  studentId,
  termId,
  termName,
}: {
  studentId: string
  termId: string
  termName: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDownload = async () => {
    setLoading(true)
    setError('')
    try {
    const res = await fetch(`/api/report-card/${studentId}?termId=${termId}`)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to generate report card')
      return
    }

    const contentType = res.headers.get('content-type')
    if (!contentType?.includes('application/pdf')) {
      setError(
        'PDF generation failed on the server (received HTML fallback). Check server logs.',
      )
      return
    }

    const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `my-report-card-${termName.replace(' ', '-')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download report card. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
            Download Report Card
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {termName} — PDF format
          </p>
        </div>
      </div>
      <div className="space-y-1">
        <Button
          onClick={handleDownload}
          disabled={loading}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </>
          )}
        </Button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  )
}
