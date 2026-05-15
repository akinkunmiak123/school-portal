import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateStudentId(schoolName: string, count: number): string {
  const prefix = schoolName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8)
  const number = String(count + 1).padStart(3, '0')
  return `${prefix}${number}`
}

function generateDefaultPassword(lastName: string, studentId: string): string {
  const lastNamePart = lastName
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .slice(0, 4)
  return `${lastNamePart}${studentId}`
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { firstName, lastName, email, classId, schoolId } = await req.json()

    const school = await prisma.school.findFirst({
      where: { id: schoolId, clerkOrgId: userId },
    })
    if (!school)
      return NextResponse.json({ error: 'School not found' }, { status: 404 })

    // Check email uniqueness
    const emailExists = await prisma.student.findFirst({
      where: { email: email.toLowerCase().trim(), schoolId },
    })
    if (emailExists) {
      return NextResponse.json(
        { error: 'A student with this email already exists in this school' },
        { status: 400 },
      )
    }

    // Auto-generate student ID
    const studentCount = await prisma.student.count({ where: { schoolId } })
    const studentId = generateStudentId(school.name, studentCount)

    // Auto-generate default password
    const defaultPassword = generateDefaultPassword(lastName, studentId)

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase().trim(),
        studentId,
        classId,
        schoolId,
        defaultPassword,
        mustChangePassword: true,
      },
    })

    return NextResponse.json({ ...student, defaultPassword })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
