import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const isImage = file.type.startsWith('image/')
    const isPDF = file.type === 'application/pdf'
    if (!isImage && !isPDF) {
      return NextResponse.json(
        { error: 'Only image or PDF files are allowed' },
        { status: 400 },
      )
    }

    // Validate file size — 2MB max
    const MAX_SIZE = 2 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          error: `File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum is 2MB.`,
        },
        { status: 400 },
      )
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()
    const filename = `${userId}-${Date.now()}.${ext}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
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

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('receipts')
      .getPublicUrl(filename)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
