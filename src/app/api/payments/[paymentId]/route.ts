import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ paymentId: string }> },
) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { paymentId } = await params
    const { status } = await req.json()

    // Verify admin owns this school
    const school = await prisma.school.findFirst({
      where: { clerkOrgId: userId },
    })
    if (!school)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payment = await prisma.feePayment.findFirst({
      where: {
        id: paymentId,
        student: { schoolId: school.id },
      },
    })
    if (!payment)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

    const updated = await prisma.feePayment.update({
      where: { id: paymentId },
      data: {
        status,
        confirmedAt: status === 'APPROVED' ? new Date() : null,
        confirmedBy: status === 'APPROVED' ? userId : null,
      },
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
