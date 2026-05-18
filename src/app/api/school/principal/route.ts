import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const school = await prisma.school.findFirst({
      where: { clerkOrgId: userId },
    })
    if (!school)
      return NextResponse.json({ error: 'School not found' }, { status: 404 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const principalName = formData.get('principalName') as string | null

    // Update principal name if provided
    if (principalName !== null) {
      await prisma.school.update({
        where: { id: school.id },
        data: { principalName },
      })
    }

    // Upload signature if file provided
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File too large. Max 1MB.' },
          { status: 400 },
        )
      }

      const ext = file.name.split('.').pop()
      const filename = `signatures/principal-${school.id}-${Date.now()}.${ext}`
      const buffer = Buffer.from(await file.arrayBuffer())

      const { error } = await supabaseAdmin.storage
        .from('receipts')
        .upload(filename, buffer, { contentType: file.type, upsert: true })

      if (error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })

      const { data: urlData } = supabaseAdmin.storage
        .from('receipts')
        .getPublicUrl(filename)

      await prisma.school.update({
        where: { id: school.id },
        data: { principalSignatureUrl: urlData.publicUrl },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
  console.error('API ERROR:', error)

  return NextResponse.json(
    {
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
    },
    { status: 500 },
  )
  }
}
