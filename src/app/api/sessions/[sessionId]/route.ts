import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { sessionId } = await params

    const session = await prisma.academicSession.findFirst({
      where: {
        id: sessionId,
        school: { clerkOrgId: userId },
      },
    })
    if (!session)
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    if (session.isCurrent) {
      return NextResponse.json(
        {
          error:
            'Cannot delete the current active session. Set another session as active first.',
        },
        { status: 400 },
      )
    }

    await prisma.academicSession.delete({ where: { id: sessionId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
