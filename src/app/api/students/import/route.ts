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

    const { students } = await req.json()

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: 'No students provided' },
        { status: 400 },
      )
    }

    const school = await prisma.school.findFirst({
      where: { id: students[0].schoolId, clerkOrgId: userId },
    })
    if (!school)
      return NextResponse.json({ error: 'School not found' }, { status: 404 })

    // Get existing emails
    const existingEmails = await prisma.student.findMany({
      where: { schoolId: school.id },
      select: { email: true },
    })
    const emailSet = new Set(existingEmails.map((s) => s.email.toLowerCase()))

    // Filter duplicates
    const uniqueStudents = students.filter(
      (s: any) => !emailSet.has(s.email.toLowerCase().trim()),
    )

    if (uniqueStudents.length === 0) {
      return NextResponse.json(
        { error: 'All students in this CSV already exist in the school' },
        { status: 400 },
      )
    }

    let currentCount = await prisma.student.count({
      where: { schoolId: school.id },
    })

    const studentsWithIds = uniqueStudents.map((s: any) => {
      const studentId = generateStudentId(school.name, currentCount)
      const defaultPassword = generateDefaultPassword(s.lastName, studentId)
      currentCount++
      return {
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email.toLowerCase().trim(),
        studentId,
        defaultPassword,
        mustChangePassword: true,
        classId: s.classId,
        schoolId: school.id,
      }
    })

    const result = await prisma.student.createMany({
      data: studentsWithIds,
      skipDuplicates: true,
    })

    return NextResponse.json({
      imported: result.count,
      skipped: students.length - result.count,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
