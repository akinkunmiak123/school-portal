import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name } = await req.json()
    if (!name)
      return NextResponse.json(
        { error: 'Department name required' },
        { status: 400 },
      )

    const school = await prisma.school.findFirst({
      where: { clerkOrgId: userId },
    })
    if (!school)
      return NextResponse.json({ error: 'School not found' }, { status: 404 })

    const existing = await prisma.department.findFirst({
      where: { name, schoolId: school.id },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Department already exists' },
        { status: 400 },
      )
    }

    const department = await prisma.department.create({
      data: { name, schoolId: school.id },
    })

    return NextResponse.json(department)
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

    const departments = await prisma.department.findMany({
      where: { schoolId: school.id },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
