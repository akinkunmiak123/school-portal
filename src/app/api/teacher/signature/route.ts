export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()

    const teacherId = cookieStore.get('teacher_session')?.value

    if (!teacherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId },
      include: { signature: true },
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    if (teacher.role !== 'CLASS_TEACHER') {
      return NextResponse.json(
        { error: 'Only class teachers can upload signatures' },
        { status: 403 },
      )
    }

    const formData = await req.formData()

    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (file.size > 1 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Max 1MB.' },
        { status: 400 },
      )
    }

    // DELETE OLD SIGNATURE
    if (teacher.signature?.signatureUrl) {
      try {
        const oldPath = teacher.signature.signatureUrl.split(
          '/storage/v1/object/public/receipts/',
        )[1]

        if (oldPath) {
          await supabaseAdmin.storage.from('receipts').remove([oldPath])
        }
      } catch (deleteError) {
        console.error('Failed to delete old teacher signature:', deleteError)
      }
    }

    const ext = file.name.split('.').pop()

    // REUSE SAME FILENAME
    const filename = `signatures/teacher-${teacher.id}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabaseAdmin.storage
      .from('receipts')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (error) {
      console.error(error)

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('receipts')
      .getPublicUrl(filename)

    const signature = await prisma.teacherSignature.upsert({
      where: { teacherId: teacher.id },
      update: {
        signatureUrl: urlData.publicUrl,
      },
      create: {
        teacherId: teacher.id,
        signatureUrl: urlData.publicUrl,
      },
    })

    return NextResponse.json(signature)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
