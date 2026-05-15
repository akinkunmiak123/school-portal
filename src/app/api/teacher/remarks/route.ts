import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const teacherId = cookieStore.get('teacher_session')?.value
    if (!teacherId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId },
    })
    if (!teacher)
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

    if (teacher.role !== 'CLASS_TEACHER') {
      return NextResponse.json(
        { error: 'Only class teachers can add remarks' },
        { status: 403 },
      )
    }

    const { studentId, termId, remark } = await req.json()

    const studentRemark = await prisma.studentRemark.upsert({
      where: { studentId_termId: { studentId, termId } },
      update: { remark, teacherId },
      create: { studentId, termId, teacherId, remark },
    })

    return NextResponse.json(studentRemark)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
