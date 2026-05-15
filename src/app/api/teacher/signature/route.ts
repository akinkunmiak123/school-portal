import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const teacherId = cookieStore.get('teacher_session')?.value
    if (!teacherId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId },
    })
    if (!teacher)
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

    if (teacher.role !== 'CLASS_TEACHER') {
      return NextResponse.json(
        { error: 'Only class teachers can upload signatures' },
        { status: 403 },
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    if (file.size > 1 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Max 1MB.' },
        { status: 400 },
      )
    }

    const ext = file.name.split('.').pop()
    const filename = `signatures/${teacher.id}-${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabaseAdmin.storage
      .from('receipts')
      .upload(filename, buffer, { contentType: file.type, upsert: true })

    if (error)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })

    const { data: urlData } = supabaseAdmin.storage
      .from('receipts')
      .getPublicUrl(filename)

    const signature = await prisma.teacherSignature.upsert({
      where: { teacherId: teacher.id },
      update: { signatureUrl: urlData.publicUrl },
      create: { teacherId: teacher.id, signatureUrl: urlData.publicUrl },
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

export async function GET() {
  try {
    const cookieStore = await cookies()
    const teacherId = cookieStore.get('teacher_session')?.value
    if (!teacherId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId },
      include: { signature: true },
    })

    return NextResponse.json(teacher?.signature ?? null)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
