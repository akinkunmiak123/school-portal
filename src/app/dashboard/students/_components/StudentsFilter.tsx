'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

type Class = { id: string; name: string }

export default function StudentsFilter({ classes }: { classes: Class[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState(searchParams.get('name') ?? '')
  const [classId, setClassId] = useState(searchParams.get('classId') ?? '')

  const applyFilter = useCallback(
    (newName: string, newClassId: string) => {
      const params = new URLSearchParams()
      if (newName) params.set('name', newName)
      if (newClassId && newClassId !== 'all') params.set('classId', newClassId)
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [pathname, router],
  )

  const clearFilter = () => {
    setName('')
    setClassId('')
    startTransition(() => {
      router.push(pathname)
    })
  }

  const hasFilter = name || (classId && classId !== 'all')

  return (
    <div className="flex gap-3 items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by name, email or ID..."
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            applyFilter(e.target.value, classId)
          }}
          className="pl-9"
        />
      </div>

      <Select
        value={classId || 'all'}
        onValueChange={(val) => {
          setClassId(val)
          applyFilter(name, val)
        }}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All classes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All classes</SelectItem>
          {classes.map((cls) => (
            <SelectItem key={cls.id} value={cls.id}>
              {cls.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilter && (
        <Button variant="ghost" size="sm" onClick={clearFilter}>
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}

      {isPending && (
        <span className="text-xs text-gray-400 animate-pulse">
          Filtering...
        </span>
      )}
    </div>
  )
}
