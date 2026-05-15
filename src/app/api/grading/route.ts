import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_GRADES = [
  { grade: 'A1', minScore: 75, maxScore: 100, remark: 'Excellent' },
  { grade: 'B2', minScore: 70, maxScore: 74, remark: 'Very Good' },
  { grade: 'B3', minScore: 65, maxScore: 69, remark: 'Good' },
  { grade: 'C4', minScore: 60, maxScore: 64, remark: 'Credit' },
  { grade: 'C5', minScore: 55, maxScore: 59, remark: 'Credit' },
  { grade: 'C6', minScore: 50, maxScore: 54, remark: 'Credit' },
  { grade: 'D7', minScore: 45, maxScore: 49, remark: 'Pass' },
  { grade: 'E8', minScore: 40, maxScore: 44, remark: 'Pass' },
  { grade: 'F9', minScore: 0, maxScore: 39, remark: 'Fail' },
]

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const school = await prisma.school.findFirst({
      where: { clerkOrgId: userId },
      include: { gradingConfig: { orderBy: { minScore: 'desc' } } },
    })
    if (!school)
      return NextResponse.json({ error: 'School not found' }, { status: 404 })

    // Seed defaults if none exist
    if (school.gradingConfig.length === 0) {
      await prisma.gradingConfig.createMany({
        data: DEFAULT_GRADES.map((g) => ({ ...g, schoolId: school.id })),
      })
      return NextResponse.json(DEFAULT_GRADES)
    }

    return NextResponse.json(school.gradingConfig)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { grades } = await req.json()

    const school = await prisma.school.findFirst({
      where: { clerkOrgId: userId },
    })
    if (!school)
      return NextResponse.json({ error: 'School not found' }, { status: 404 })

    // Delete all and recreate
    await prisma.gradingConfig.deleteMany({ where: { schoolId: school.id } })
    await prisma.gradingConfig.createMany({
      data: grades.map((g: any) => ({ ...g, schoolId: school.id })),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
