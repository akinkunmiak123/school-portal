import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ subjectId: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { subjectId } = await params
    const {
      name,
      subjectType,
      departmentId: rawDepartmentId,
    } = await req.json()
    const departmentId = rawDepartmentId === '' ? null : rawDepartmentId

    if (!name)
      return NextResponse.json(
        { error: 'Subject name required' },
        { status: 400 },
      )

    const school = await prisma.school.findFirst({
      where: { clerkOrgId: userId },
    })
    if (!school)
      return NextResponse.json({ error: 'School not found' }, { status: 404 })

    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, schoolId: school.id },
    })
    if (!subject)
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })

    if (rawDepartmentId !== undefined && departmentId !== null) {
      const department = await prisma.department.findFirst({
        where: { id: departmentId, schoolId: school.id },
      })
      if (!department) {
        return NextResponse.json(
          { error: 'Invalid department selected' },
          { status: 400 },
        )
      }
    }

    const finalDepartmentId =
      rawDepartmentId !== undefined ? departmentId : subject.departmentId

    // Check if another subject with same name+level+dept already exists
    const duplicate = await prisma.subject.findFirst({
      where: {
        name,
        level: subject.level,
        departmentId: finalDepartmentId,
        schoolId: school.id,
        id: { not: subjectId }, // exclude self
      },
    })

    if (duplicate) {
      return NextResponse.json(
        {
          error: `A subject named "${name}" already exists in this level/department`,
        },
        { status: 400 },
      )
    }

    const updated = await prisma.subject.update({
      where: { id: subjectId },
      data: {
        name,
        subjectType: subjectType ?? subject.subjectType,
        departmentId: finalDepartmentId,
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Subject PATCH error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A subject with this name already exists' },
        { status: 400 },
      )
    }
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid department selected' },
        { status: 400 },
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ subjectId: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { subjectId } = await params

    const school = await prisma.school.findFirst({
      where: { clerkOrgId: userId },
    })
    if (!school)
      return NextResponse.json({ error: 'School not found' }, { status: 404 })

    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, schoolId: school.id },
    })
    if (!subject)
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })

    await prisma.subject.delete({ where: { id: subjectId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
