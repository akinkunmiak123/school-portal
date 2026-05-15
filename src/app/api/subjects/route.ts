import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const {
      name,
      subjectType,
      classId, // for PRIMARY
      level, // for SECONDARY (JSS 1, SS 1 etc.)
      departmentId, // for DEPARTMENT/VOCATIONAL/OPTIONAL
      optionalGroupId, // for OPTIONAL — pairs two subjects together
    } = await req.json()

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

    // Check for duplicate
    const existing = await prisma.subject.findFirst({
      where: {
        name,
        level: level || null,
        departmentId: departmentId || null,
        schoolId: school.id,
      },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Subject already exists' },
        { status: 400 },
      )
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        subjectType: subjectType || 'GENERAL',
        classId: classId || null,
        level: level || null,
        departmentId: departmentId || null,
        optionalGroupId: optionalGroupId || null,
        schoolId: school.id,
      },
    })

    return NextResponse.json(subject)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
