import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ activityId: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { activityId } = await params
    const { title, content, date } = await req.json()

    const activity = await prisma.schoolActivity.findFirst({
      where: { id: activityId, school: { clerkOrgId: userId } },
    })
    if (!activity)
      return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = await prisma.schoolActivity.update({
      where: { id: activityId },
      data: { title, content, date: new Date(date) },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ activityId: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { activityId } = await params

    const activity = await prisma.schoolActivity.findFirst({
      where: { id: activityId, school: { clerkOrgId: userId } },
    })
    if (!activity)
      return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.schoolActivity.delete({ where: { id: activityId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
