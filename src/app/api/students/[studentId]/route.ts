import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { studentId } = await params
    const {
      firstName,
      lastName,
      email,
      studentId: newStudentId,
      classId,
    } = await req.json()

    const student = await prisma.student.findFirst({
      where: { id: studentId, school: { clerkOrgId: userId } },
    })
    if (!student)
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    if (email !== student.email) {
      const emailExists = await prisma.student.findFirst({
        where: { email, schoolId: student.schoolId, id: { not: studentId } },
      })
      if (emailExists)
        return NextResponse.json(
          { error: 'A student with this email already exists' },
          { status: 400 },
        )
    }

    if (newStudentId !== student.studentId) {
      const idExists = await prisma.student.findFirst({
        where: {
          studentId: newStudentId,
          schoolId: student.schoolId,
          id: { not: studentId },
        },
      })
      if (idExists)
        return NextResponse.json(
          { error: 'This Student ID is already taken' },
          { status: 400 },
        )
    }

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { firstName, lastName, email, studentId: newStudentId, classId },
    })

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
  { params }: { params: Promise<{ studentId: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { studentId } = await params

    const student = await prisma.student.findFirst({
      where: { id: studentId, school: { clerkOrgId: userId } },
    })
    if (!student)
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    await prisma.student.delete({ where: { id: studentId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
