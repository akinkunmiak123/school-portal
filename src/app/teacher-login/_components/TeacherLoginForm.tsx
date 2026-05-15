'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Loader2,
  Eye,
  EyeOff,
  Mail,
  RefreshCw,
  CheckCircle,
} from 'lucide-react'

type Step = 'credentials' | 'otp' | 'done'

export default function TeacherLoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('credentials')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [form, setForm] = useState({ email: '', password: '' })

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/teacher/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStep('otp')
      setCountdown(60)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setLoading(true)
    setError('')
    setOtp(['', '', '', '', '', ''])
    try {
      const res = await fetch('/api/teacher/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCountdown(60)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOTPChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
    if (newOtp.every((d) => d !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''))
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputRefs.current[5]?.focus()
      handleVerifyOTP(pasted)
    }
  }

  const handleVerifyOTP = async (otpValue?: string) => {
    const code = otpValue ?? otp.join('')
    if (code.length !== 6) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/teacher/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStep('done')
      setTimeout(() => router.push('/teacher-portal'), 1500)
    } catch (err: any) {
      setError(err.message)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  if (step === 'done') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
          <CheckCircle className="w-14 h-14 text-green-600" />
          <p className="font-bold text-green-700 text-xl">Welcome!</p>
          <p className="text-sm text-gray-500">Taking you to your portal...</p>
        </CardContent>
      </Card>
    )
  }

  if (step === 'otp') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-600" />
            Check Your Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
            <p className="text-sm text-purple-700 dark:text-purple-300">
              We sent a 6-digit code to
            </p>
            <p className="font-semibold text-purple-800 dark:text-purple-200 mt-0.5">
              {form.email}
            </p>
            <p className="text-xs text-purple-600 mt-1">
              Code expires in 10 minutes
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-center block">Enter 6-digit code</Label>
            <div className="flex gap-2 justify-center" onPaste={handleOTPPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(i, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(i, e)}
                  disabled={loading}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all disabled:opacity-50"
                />
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-purple-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Verifying...</span>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md text-center">
              {error}
            </p>
          )}

          <Button
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => handleVerifyOTP()}
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              onClick={() => {
                setStep('credentials')
                setOtp(['', '', '', '', '', ''])
                setError('')
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ← Back
            </button>
            <button
              onClick={handleResend}
              disabled={countdown > 0 || loading}
              className="flex items-center gap-1 text-purple-600 hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCredentials} className="space-y-4">
          <div className="space-y-2">
            <Label>School Email</Label>
            <Input
              type="email"
              placeholder="Your registered school email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password provided by your school admin"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Format: first 4 letters of last name + teacher ID. e.g.
              ezetch-kunmi001
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending code...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Verification Code
              </>
            )}
          </Button>

          <p className="text-center text-xs text-gray-400 mt-2">
            Not a teacher?{' '}
            <a href="/sign-in" className="text-blue-600 hover:underline">
              Student / Admin login →
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
