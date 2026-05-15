import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json()

    const otpRecord = await prisma.teacherOTP.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        otp: otp.trim(),
        used: false,
      },
    })

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please check the code and try again.' },
        { status: 400 },
      )
    }

    if (new Date() > otpRecord.expiresAt) {
      await prisma.teacherOTP.update({
        where: { id: otpRecord.id },
        data: { used: true },
      })
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 },
      )
    }

    const teacher = await prisma.teacher.findFirst({
      where: { email: email.toLowerCase().trim() },
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found.' }, { status: 404 })
    }

    // Mark OTP as used
    await prisma.teacherOTP.update({
      where: { id: otpRecord.id },
      data: { used: true },
    })

    // Set a session cookie for the teacher
    const cookieStore = await cookies()
    cookieStore.set('teacher_session', teacher.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    })

    return NextResponse.json({
      success: true,
      role: teacher.role,
      teacherId: teacher.id,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
