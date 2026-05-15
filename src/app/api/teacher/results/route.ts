import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

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
    const cookieStore = await cookies()
    const teacherId = cookieStore.get('teacher_session')?.value
    if (!teacherId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId },
      include: {
        school: {
          include: { gradingConfig: { orderBy: { minScore: 'desc' } } },
        },
      },
    })
    if (!teacher)
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

    const { studentId, subjectId, termId, caScore, midterm, examScore } =
      await req.json()

    const total = (caScore || 0) + (midterm || 0) + (examScore || 0)
    const { grade, remark } = calculateGrade(
      total,
      teacher.school.gradingConfig,
    )

    const result = await prisma.result.upsert({
      where: {
        studentId_subjectId_termId: { studentId, subjectId, termId },
      },
      update: { caScore, midterm, examScore, total, grade, remark, teacherId },
      create: {
        studentId,
        subjectId,
        termId,
        teacherId,
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
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
