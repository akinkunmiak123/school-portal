import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const JSS_LEVELS = ['JSS 1', 'JSS 2', 'JSS 3']
const SS_LEVELS = ['SS 1', 'SS 2', 'SS 3']

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { schoolType } = await req.json()

    const school = await prisma.school.findFirst({
      where: { clerkOrgId: userId },
    })
    if (!school)
      return NextResponse.json({ error: 'School not found' }, { status: 404 })

    // Update school type
    await prisma.school.update({
      where: { id: school.id },
      data: { schoolType },
    })

    // Seed secondary levels if needed
    if (schoolType === 'SECONDARY' || schoolType === 'BOTH') {
      const levels = [...JSS_LEVELS, ...SS_LEVELS]
      for (const level of levels) {
        const category = level.startsWith('JSS') ? 'JSS' : 'SS'
        const existing = await prisma.class.findFirst({
          where: { schoolId: school.id, level, name: level },
        })
        if (!existing) {
          await prisma.class.create({
            data: {
              name: level,
              level,
              category,
              schoolId: school.id,
            },
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
