import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { studentId, email, defaultPassword } = await req.json()

    const student = await prisma.student.findFirst({
      where: {
        studentId,
        email: email.toLowerCase().trim(),
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'No student found with that ID and email combination' },
        { status: 404 },
      )
    }

    // Verify default password
    if (
      student.defaultPassword &&
      student.defaultPassword !== defaultPassword
    ) {
      return NextResponse.json(
        {
          error:
            'Incorrect default password. Please contact your school admin.',
        },
        { status: 401 },
      )
    }

    if (student.clerkUserId && !student.clerkUserId.startsWith('pending_')) {
      return NextResponse.json(
        { error: 'This student account is already claimed' },
        { status: 400 },
      )
    }

    // Link clerk account to student
    await prisma.student.update({
      where: { id: student.id },
      data: { clerkUserId: userId },
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
