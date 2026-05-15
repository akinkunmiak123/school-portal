import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateTeacherId(schoolName: string, count: number): string {
  const prefix = schoolName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 6)
  return `tch-${prefix}${String(count + 1).padStart(3, '0')}`
}

function generateDefaultPassword(lastName: string, teacherId: string): string {
  const lastNamePart = lastName
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .slice(0, 4)
  return `${lastNamePart}${teacherId}`
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { firstName, lastName, email, classIds, role, tutorLevel, schoolId } =
      await req.json()

    const school = await prisma.school.findFirst({
      where: { id: schoolId, clerkOrgId: userId },
    })
    if (!school)
      return NextResponse.json({ error: 'School not found' }, { status: 404 })

    // Check email uniqueness
    const existing = await prisma.teacher.findFirst({
      where: { email: email.toLowerCase().trim(), schoolId },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'A teacher with this email already exists' },
        { status: 400 },
      )
    }

    // Generate teacher ID and password
    const teacherCount = await prisma.teacher.count({ where: { schoolId } })
    const teacherId = generateTeacherId(school.name, teacherCount)
    const defaultPassword = generateDefaultPassword(lastName, teacherId)

    const teacher = await prisma.teacher.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase().trim(),
        schoolId,
        clerkUserId: `pending_${email}`,
        role: role || 'CLASS_TEACHER',
        tutorLevel: role === 'YEAR_TUTOR' ? tutorLevel : null,
        defaultPassword,
        mustChangePassword: true,
      },
    })

    // Assign class arms for CLASS_TEACHER
    if (role !== 'YEAR_TUTOR' && classIds && classIds.length > 0) {
      await prisma.classTeacher.createMany({
        data: classIds.map((classId: string) => ({
          classId,
          teacherId: teacher.id,
        })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json({
      ...teacher,
      teacherId,
      defaultPassword,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
