import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ departmentId: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { departmentId } = await params
    const { name } = await req.json()

    const dept = await prisma.department.findFirst({
      where: { id: departmentId, school: { clerkOrgId: userId } },
    })
    if (!dept)
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 },
      )

    const updated = await prisma.department.update({
      where: { id: departmentId },
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
  { params }: { params: Promise<{ departmentId: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { departmentId } = await params

    const dept = await prisma.department.findFirst({
      where: { id: departmentId, school: { clerkOrgId: userId } },
    })
    if (!dept)
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 },
      )

    await prisma.department.delete({ where: { id: departmentId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
