import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function calculateGrade(
  total: number,
  gradingConfig: {
    grade: string
    minScore: number
    maxScore: number
    remark: string
  }[],
) {
  const config = gradingConfig.find(
    (g) => total >= g.minScore && total <= g.maxScore,
  )
  return config
    ? { grade: config.grade, remark: config.remark }
    : { grade: 'F9', remark: 'Fail' }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { studentId, subjectId, termId, caScore, midterm, examScore } =
      await req.json()

    // Find school for this admin
    const school = await prisma.school.findFirst({
      where: { clerkOrgId: userId },
      include: { gradingConfig: { orderBy: { minScore: 'desc' } } },
    })
    if (!school)
      return NextResponse.json({ error: 'School not found' }, { status: 404 })

    // Get or create a teacher record for the admin
    let teacher = await prisma.teacher.findFirst({
      where: { school: { clerkOrgId: userId } },
    })

    // If no teacher exists, create a placeholder for the admin
    if (!teacher) {
      teacher = await prisma.teacher.create({
        data: {
          clerkUserId: userId,
          firstName: 'Admin',
          lastName: 'User',
          email: `admin-${userId}@school.portal`,
          schoolId: school.id,
        },
      })
    }

    const total = (caScore || 0) + (midterm || 0) + (examScore || 0)
    const { grade, remark } = calculateGrade(total, school.gradingConfig)

    const result = await prisma.result.upsert({
      where: {
        studentId_subjectId_termId: { studentId, subjectId, termId },
      },
      update: {
        caScore,
        midterm,
        examScore,
        total,
        grade,
        remark,
        teacherId: teacher.id,
      },
      create: {
        studentId,
        subjectId,
        termId,
        teacherId: teacher.id,
        caScore,
        midterm,
        examScore,
        total,
        grade,
        remark,
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Results error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
