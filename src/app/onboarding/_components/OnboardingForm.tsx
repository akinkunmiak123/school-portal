'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function OnboardingForm() {
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>School Information</CardTitle>
        <CardDescription>
          You are setting this up as{' '}
          <strong>{user?.emailAddresses[0]?.emailAddress}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">School Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Greenfield Secondary School"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">School Address</Label>
            <Input
              id="address"
              name="address"
              placeholder="e.g. 12 Education Road, Lagos"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="e.g. 08012345678"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">School Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. info@greenfield.edu.ng"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up your school...
              </>
            ) : (
              'Create School & Continue'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
