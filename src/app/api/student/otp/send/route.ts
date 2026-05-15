import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  try {
    const { email, studentId } = await req.json()

    if (!email || !studentId) {
      return NextResponse.json(
        { error: 'Email and Student ID are required' },
        { status: 400 },
      )
    }

    // Verify student exists with that email + studentId combo
    const student = await prisma.student.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        studentId: studentId.trim(),
      },
      include: { school: true },
    })

    if (!student) {
      return NextResponse.json(
        {
          error:
            'No student found with that ID and email. Please check with your school admin.',
        },
        { status: 404 },
      )
    }

    // Delete any existing unused OTPs for this email
    await prisma.studentOTP.deleteMany({
      where: { email: email.toLowerCase().trim(), used: false },
    })

    // Generate new OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await prisma.studentOTP.create({
      data: {
        email: email.toLowerCase().trim(),
        otp,
        expiresAt,
      },
    })

    // Send OTP email via Resend
    await resend.emails.send({
      from: 'SchoolPortal <onboarding@resend.dev>',
      to: email,
      subject: 'Your SchoolPortal Login Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1d4ed8; margin-bottom: 8px;">SchoolPortal</h2>
          <p style="color: #374151; margin-bottom: 24px;">
            Hello <strong>${student.firstName}</strong>, here is your one-time login code for 
            <strong>${student.school.name}</strong>:
          </p>
          
          <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #1d4ed8; margin: 0;">
              ${otp}
            </p>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            This code expires in <strong>10 minutes</strong>. 
            Do not share this code with anyone.
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            Your Student ID: <strong>${student.studentId}</strong>
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">
            If you did not request this code, please contact your school admin.
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
