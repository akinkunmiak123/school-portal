import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { termId, sessionId } = await req.json()

    const school = await prisma.school.findFirst({
      where: { clerkOrgId: userId },
    })
    if (!school)
      return NextResponse.json({ error: 'School not found' }, { status: 404 })

    // Clear all current flags
    await prisma.academicSession.updateMany({
      where: { schoolId: school.id },
      data: { isCurrent: false },
    })
    await prisma.term.updateMany({
      where: { session: { schoolId: school.id } },
      data: { isCurrent: false },
    })

    // Set new current
    await prisma.academicSession.update({
      where: { id: sessionId },
      data: { isCurrent: true },
    })
    await prisma.term.update({
      where: { id: termId },
      data: { isCurrent: true },
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
