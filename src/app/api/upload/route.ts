import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'  // add this

export async function POST(req: Request) {
  try {
    console.log('Upload handler invoked:', {
      url: (req as any).url,
      method: req.method,
    })
    const contentType =
      (req as any).headers?.get?.('content-type') ||
      (req as any).headers?.['content-type']
    console.log('Content-Type:', contentType)
    try {
      const headersObj = {}
      for (const [k, v] of (req as any).headers?.entries?.() ?? []) {
        ;(headersObj as any)[k] = v
      }
      console.log('Request headers:', headersObj)
    } catch (e) {
      console.log('Request headers (fallback):', (req as any).headers)
    }
    const cookieStore = await cookies()
    const studentId = cookieStore.get('student_session')?.value
    if (!studentId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const student = await prisma.student.findFirst({ where: { id: studentId } })
    if (!student)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file)
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const isImage = file.type.startsWith('image/')
    const isPDF = file.type === 'application/pdf'
    if (!isImage && !isPDF)
      return NextResponse.json(
        { error: 'Only image or PDF files are allowed' },
        { status: 400 },
      )

    const MAX_SIZE = 2 * 1024 * 1024
    if (file.size > MAX_SIZE)
      return NextResponse.json(
        {
          error: `File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum is 2MB.`,
        },
        { status: 400 },
      )

    const ext = file.name.split('.').pop()
    const filename = `${studentId}-${Date.now()}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error } = await supabaseAdmin.storage
      .from('receipts')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Supabase storage error:', error)
      return NextResponse.json(
        { error: 'Failed to upload file. Please try again.' },
        { status: 500 },
      )
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('receipts')
      .getPublicUrl(filename)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error: any) {
    console.error('Upload error:', error?.message ?? error, error)
    console.error(
      'Request headers:',
      JSON.stringify(Object.fromEntries((req as any).headers ?? [])),
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
