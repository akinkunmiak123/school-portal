import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateReportCardHTML } from '@/lib/reportCard'
import { cookies } from 'next/headers'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  try {
    const { studentId } = await params
    const { searchParams } = new URL(req.url)
    const termId = searchParams.get('termId')
    if (!termId)
      return NextResponse.json({ error: 'termId required' }, { status: 400 })

    // Check auth — admin, student, or teacher cookie
  const { userId } = await auth()
  const cookieStore = await cookies()
  const teacherCookieId = cookieStore.get('teacher_session')?.value
  const studentCookieId = cookieStore.get('student_session')?.value

   let isAuthorized = false
   let school: any = null

   if (userId) {
     // Check if admin
     school = await prisma.school.findFirst({
       where: { clerkOrgId: userId },
     })
     if (school) isAuthorized = true
   }

   // Check if student themselves (cookie-based)
   if (!isAuthorized && studentCookieId && studentCookieId === studentId) {
     const payment = await prisma.feePayment.findFirst({
       where: { studentId, termId, status: 'APPROVED' },
     })
     if (payment) isAuthorized = true
   }

   if (!isAuthorized && teacherCookieId) {
     const teacher = await prisma.teacher.findFirst({
       where: { id: teacherCookieId },
     })
     if (teacher) isAuthorized = true
   }

   if (!isAuthorized) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
   }

    // Fetch student data
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: true,
        school: true,
        results: {
          where: { termId },
          include: { subject: true },
          orderBy: { subject: { name: 'asc' } },
        },
      },
    })

    if (!student)
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    const term = await prisma.term.findUnique({
      where: { id: termId },
      include: { session: true },
    })

    if (!term)
      return NextResponse.json({ error: 'Term not found' }, { status: 404 })

    // Get teacher remark for this student
    const studentRemark = await prisma.studentRemark.findFirst({
      where: { studentId, termId },
      include: {
        teacher: {
          include: { signature: true },
        },
      },
    })

    // Get class teacher signature — find class teacher assigned to this class
    const classTeacherRecord = await prisma.classTeacher.findFirst({
      where: { classId: student.classId },
      include: {
        teacher: {
          include: { signature: true },
        },
      },
    })

    // Get school with principal signature
    const schoolWithSig = await prisma.school.findUnique({
      where: { id: student.schoolId },
    })

    const reportData = {
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
        studentId: student.studentId,
        className: student.class.name,
      },
      school: {
        name: student.school.name,
        address: student.school.address,
        phone: student.school.phone,
        email: student.school.email,
      },
      session: term.session.name,
      term: term.name,
      results: student.results.map((r) => ({
        subjectName: r.subject.name,
        caScore: r.caScore,
        midterm: r.midterm,
        examScore: r.examScore,
        total: r.total,
        grade: r.grade,
        remark: r.remark,
      })),
      teacherRemark: studentRemark?.remark ?? null,
      teacherSignatureUrl:
        studentRemark?.teacher?.signature?.signatureUrl ??
        classTeacherRecord?.teacher?.signature?.signatureUrl ??
        null,
      teacherName: studentRemark?.teacher
        ? `${studentRemark.teacher.firstName} ${studentRemark.teacher.lastName}`
        : classTeacherRecord?.teacher
          ? `${classTeacherRecord.teacher.firstName} ${classTeacherRecord.teacher.lastName}`
          : null,
      principalSignatureUrl: schoolWithSig?.principalSignatureUrl ?? null,
      principalName: schoolWithSig?.principalName ?? null,
    }

    const html = generateReportCardHTML(reportData)

    // Generate PDF
    let browser
    try {
      const isProd = process.env.NODE_ENV === 'production'
   if (isProd) {
     const chromium = await import('@sparticuz/chromium-min')
     const puppeteer = await import('puppeteer-core')
     browser = await puppeteer.default.launch({
       args: chromium.default.args,
       executablePath: await chromium.default.executablePath(
         'https://github.com/Sparticuz/chromium/releases/download/v148.0.0/chromium-v148.0.0-pack.x64.tar',
       ),
       headless: true,
     })
   } else {
     const puppeteerModule = await import('puppeteer')
     const puppeteer = puppeteerModule.default ?? puppeteerModule
     browser = await puppeteer.launch({
       headless: true,
       args: ['--no-sandbox', '--disable-setuid-sandbox'],
     })
   }

      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      })
      await browser.close()

    return new NextResponse(Buffer.from(pdf) as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="report-card-${student.studentId}-${term.name.replace(' ', '-')}.pdf"`,
      },
    })
    } catch (err) {
      if (browser) await browser.close()
      console.error('PDF error:', err)
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
      })
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
