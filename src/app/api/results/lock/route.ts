import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { classId, termId, lock } = await req.json()

    // Verify class belongs to admin's school
    const cls = await prisma.class.findFirst({
      where: { id: classId, school: { clerkOrgId: userId } },
    })
    if (!cls)
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })

    // Get all students in this class
    const students = await prisma.student.findMany({
      where: { classId },
      select: { id: true },
    })

    const studentIds = students.map((s) => s.id)

    if (studentIds.length === 0) {
      return NextResponse.json({ success: true, updated: 0 })
    }

    // Update all results for these students in this term
    const updated = await prisma.result.updateMany({
      where: {
        studentId: { in: studentIds },
        termId,
      },
      data: { isLocked: lock },
    })

    return NextResponse.json({ success: true, updated: updated.count })
  } catch (error) {
    console.error('Lock error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
