import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { receiptUrl, termId } = await req.json()

    // Find student by clerkUserId
    const student = await prisma.student.findFirst({
      where: { clerkUserId: userId },
    })
    if (!student) {
      return NextResponse.json(
        { error: 'Student record not found' },
        { status: 404 },
      )
    }

    // Check if already submitted
    const existing = await prisma.feePayment.findFirst({
      where: { studentId: student.id, termId },
    })

    if (existing) {
      // Update receipt if rejected
      if (existing.status === 'REJECTED') {
        const updated = await prisma.feePayment.update({
          where: { id: existing.id },
          data: { receiptUrl, status: 'PENDING' },
        })
        return NextResponse.json(updated)
      }
      return NextResponse.json(
        { error: 'You have already submitted a receipt for this term' },
        { status: 400 },
      )
    }

    const payment = await prisma.feePayment.create({
      data: { studentId: student.id, termId, receiptUrl, status: 'PENDING' },
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
