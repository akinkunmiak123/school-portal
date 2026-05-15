import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, schoolId, category, level } = await req.json()
    if (!name)
      return NextResponse.json(
        { error: 'Class name is required' },
        { status: 400 },
      )

    const school = await prisma.school.findFirst({
      where: { id: schoolId, clerkOrgId: userId },
    })
    if (!school)
      return NextResponse.json({ error: 'School not found' }, { status: 404 })

    // Check duplicate name in school
    const existing = await prisma.class.findFirst({
      where: { name, schoolId },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'A class with this name already exists' },
        { status: 400 },
      )
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        schoolId,
        category: category || 'PRIMARY',
        level: level || null,
      },
    })

    return NextResponse.json(newClass)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
