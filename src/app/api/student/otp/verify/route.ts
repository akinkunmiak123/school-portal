import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { email, studentId, otp } = await req.json()

    if (!email || !studentId || !otp) {
      return NextResponse.json(
        { error: 'Email, Student ID and OTP are required' },
        { status: 400 },
      )
    }

    // Find the OTP record
    const otpRecord = await prisma.studentOTP.findFirst({
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

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      await prisma.studentOTP.update({
        where: { id: otpRecord.id },
        data: { used: true },
      })
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 },
      )
    }

    // Find the student
    const student = await prisma.student.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        studentId: studentId.trim(),
      },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 })
    }

    // Check if already claimed by different user
    if (
      student.clerkUserId &&
      !student.clerkUserId.startsWith('pending_') &&
      student.clerkUserId !== userId
    ) {
      return NextResponse.json(
        { error: 'This student account is already linked to another login.' },
        { status: 400 },
      )
    }

    // Mark OTP as used
    await prisma.studentOTP.update({
      where: { id: otpRecord.id },
      data: { used: true },
    })

    // Link clerk account to student and clear mustChangePassword
    await prisma.student.update({
      where: { id: student.id },
      data: {
        clerkUserId: userId,
        mustChangePassword: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
