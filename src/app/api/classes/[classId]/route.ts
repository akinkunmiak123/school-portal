import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ classId: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { classId } = await params
    const { name } = await req.json()

    const cls = await prisma.class.findFirst({
      where: { id: classId, school: { clerkOrgId: userId } },
    })
    if (!cls)
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })

    const existing = await prisma.class.findFirst({
      where: { name, schoolId: cls.schoolId, id: { not: classId } },
    })
    if (existing)
      return NextResponse.json(
        { error: 'A class with this name already exists' },
        { status: 400 },
      )

    const updated = await prisma.class.update({
      where: { id: classId },
      data: { name },
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
  { params }: { params: Promise<{ classId: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { classId } = await params

    const cls = await prisma.class.findFirst({
      where: { id: classId, school: { clerkOrgId: userId } },
    })
    if (!cls)
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })

    await prisma.class.delete({ where: { id: classId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
