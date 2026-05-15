import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { studentId } = await params
    const { departmentId, optionalSubjectId, vocationalSubjectId } =
      await req.json()

    const student = await prisma.student.findFirst({
      where: { id: studentId, school: { clerkOrgId: userId } },
    })
    if (!student)
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    const assignment = await prisma.studentDepartment.upsert({
      where: { studentId },
      update: {
        departmentId,
        optionalSubjectId: optionalSubjectId || null,
        vocationalSubjectId: vocationalSubjectId || null,
      },
      create: {
        studentId,
        departmentId,
        optionalSubjectId: optionalSubjectId || null,
        vocationalSubjectId: vocationalSubjectId || null,
      },
    })

    return NextResponse.json(assignment)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { studentId } = await params

    await prisma.studentDepartment.deleteMany({ where: { studentId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
