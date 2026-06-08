import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { email, studentId, otp } = await req.json()

    if (!email || !otp || !studentId) {
      return NextResponse.json(
        { error: 'Email, Student ID and OTP are required' },
        { status: 400 },
      )
    }

    const record = await prisma.studentOTP.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        otp,
        used: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 400 },
      )
    }

    // Mark OTP as used
    await prisma.studentOTP.update({
      where: { id: record.id },
      data: { used: true },
    })

    // Get student
    const student = await prisma.student.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        studentId: studentId.trim(),
      },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Set cookie session
    const cookieStore = await cookies()
    cookieStore.set('student_session', student.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
