'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

export default function SchoolTypeSelector({
  schoolId,
  currentType,
}: {
  schoolId: string
  currentType: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleChange = async (value: string) => {
    setLoading(true)
    try {
      await fetch('/api/school/type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolType: value }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
      <Select defaultValue={currentType} onValueChange={handleChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PRIMARY">Primary Only</SelectItem>
          <SelectItem value="SECONDARY">Secondary Only</SelectItem>
          <SelectItem value="BOTH">Primary & Secondary</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
