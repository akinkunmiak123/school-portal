import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, content, date } = await req.json()

    const school = await prisma.school.findFirst({
      where: { clerkOrgId: userId },
    })
    if (!school)
      return NextResponse.json({ error: 'School not found' }, { status: 404 })

    const activity = await prisma.schoolActivity.create({
      data: { title, content, date: new Date(date), schoolId: school.id },
    })

    return NextResponse.json(activity)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const school = await prisma.school.findFirst({
      where: { clerkOrgId: userId },
    })
    if (!school)
      return NextResponse.json({ error: 'School not found' }, { status: 404 })

    const activities = await prisma.schoolActivity.findMany({
      where: { schoolId: school.id },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
