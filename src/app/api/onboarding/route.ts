import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, address, phone, email } = await req.json()

    if (!name) {
      return NextResponse.json({ error: 'School name is required' }, { status: 400 })
    }

    // Check if school already exists
    const existing = await prisma.school.findFirst({
      where: { clerkOrgId: userId },
    })

    if (existing) {
      return NextResponse.json({ error: 'School already exists' }, { status: 400 })
    }

    // Create the school
    const school = await prisma.school.create({
      data: {
        name,
        address: address || null,
        phone: phone || null,
        email: email || null,
        clerkOrgId: userId,
      },
    })

    // Create default academic session and first term
    const session = await prisma.academicSession.create({
      data: {
        name: '2024/2025',
        isCurrent: true,
        schoolId: school.id,
      },
    })

    await prisma.term.create({
      data: {
        name: 'First Term',
        isCurrent: true,
        sessionId: session.id,
      },
    })

    return NextResponse.json({ success: true, school })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}