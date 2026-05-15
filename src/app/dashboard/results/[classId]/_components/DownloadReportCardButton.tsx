'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

export default function DownloadReportCardButton({
  studentId,
  studentName,
  termId,
}: {
  studentId: string
  studentName: string
  termId: string
}) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/report-card/${studentId}?termId=${termId}`)

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to generate report card')
        return
      }

      const contentType = res.headers.get('content-type')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download =
        contentType === 'application/pdf'
          ? `report-card-${studentName.replace(' ', '-')}.pdf`
          : `report-card-${studentName.replace(' ', '-')}.html`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to download report card')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDownload}
      disabled={loading}
      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 text-xs"
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <>
          <Download className="w-3 h-3 mr-1" />
          Report
        </>
      )}
    </Button>
  )
}
