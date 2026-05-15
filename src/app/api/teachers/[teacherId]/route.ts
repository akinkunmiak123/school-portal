import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ teacherId: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { teacherId } = await params
    const { firstName, lastName, email, classIds, role, tutorLevel } =
      await req.json()

    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, school: { clerkOrgId: userId } },
    })
    if (!teacher)
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

    // Check email uniqueness
    if (email !== teacher.email) {
      const emailExists = await prisma.teacher.findFirst({
        where: { email, schoolId: teacher.schoolId, id: { not: teacherId } },
      })
      if (emailExists) {
        return NextResponse.json(
          { error: 'A teacher with this email already exists' },
          { status: 400 },
        )
      }
    }

    const updated = await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        firstName,
        lastName,
        email,
        role: role || teacher.role,
        tutorLevel: role === 'YEAR_TUTOR' ? tutorLevel : null,
      },
    })

    // Update class assignments for CLASS_TEACHER
    if (classIds !== undefined) {
      await prisma.classTeacher.deleteMany({ where: { teacherId } })
      if (classIds.length > 0 && role !== 'YEAR_TUTOR') {
        await prisma.classTeacher.createMany({
          data: classIds.map((classId: string) => ({ classId, teacherId })),
          skipDuplicates: true,
        })
      }
    }

    return NextResponse.json(updated)
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
  { params }: { params: Promise<{ teacherId: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { teacherId } = await params

    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, school: { clerkOrgId: userId } },
    })
    if (!teacher)
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

    // Delete related records first to avoid foreign key violations
    await prisma.classTeacher.deleteMany({ where: { teacherId } })
    await prisma.studentRemark.deleteMany({ where: { teacherId } })
    await prisma.teacherSignature.deleteMany({ where: { teacherId } })
    await prisma.result.updateMany({
      where: { teacherId },
      data: { teacherId: teacherId }, // keep results but they'll orphan — or handle as needed
    })

    await prisma.teacher.delete({ where: { id: teacherId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}