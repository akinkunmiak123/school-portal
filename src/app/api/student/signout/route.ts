import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('student_session')
  return NextResponse.redirect(
    new URL(
      '/student-setup',
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    ),
  )
}
