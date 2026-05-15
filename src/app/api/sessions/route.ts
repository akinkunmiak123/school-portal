import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, schoolId } = await req.json()

    const school = await prisma.school.findFirst({
      where: { id: schoolId, clerkOrgId: userId },
    })
    if (!school)
      return NextResponse.json({ error: 'School not found' }, { status: 404 })

    const session = await prisma.academicSession.create({
      data: {
        name,
        schoolId,
        isCurrent: false,
        terms: {
          create: [
            { name: 'First Term', isCurrent: false },
            { name: 'Second Term', isCurrent: false },
            { name: 'Third Term', isCurrent: false },
          ],
        },
      },
      include: { terms: true },
    })

    return NextResponse.json(session)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
