import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      )
    }

    // Find teacher by email
    const teacher = await prisma.teacher.findFirst({
      where: { email: email.toLowerCase().trim() },
      include: { school: true },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'No teacher found with this email' },
        { status: 404 },
      )
    }

    // Verify password
    if (teacher.defaultPassword !== password) {
      return NextResponse.json(
        { error: 'Incorrect password. Please contact your school admin.' },
        { status: 401 },
      )
    }

    // Delete existing unused OTPs
    await prisma.teacherOTP.deleteMany({
      where: { email: email.toLowerCase().trim(), used: false },
    })

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.teacherOTP.create({
      data: {
        email: email.toLowerCase().trim(),
        otp,
        expiresAt,
      },
    })

    // Send OTP email
    await resend.emails.send({
      from: 'SchoolPortal <onboarding@resend.dev>',
      to: email,
      subject: 'Your Teacher Portal Login Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #7c3aed;">SchoolPortal — Teacher Access</h2>
          <p>Hello <strong>${teacher.firstName} ${teacher.lastName}</strong>,</p>
          <p>Your one-time login code for <strong>${teacher.school.name}</strong>:</p>
          <div style="background: #f5f3ff; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #7c3aed; margin: 0;">
              ${otp}
            </p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This code expires in <strong>10 minutes</strong>.
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            Role: <strong>${teacher.role === 'YEAR_TUTOR' ? 'Year Tutor' : 'Class Teacher'}</strong>
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
