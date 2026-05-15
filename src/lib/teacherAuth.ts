import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function getTeacherFromCookie() {
  const cookieStore = await cookies()
  const teacherId = cookieStore.get('teacher_session')?.value
  if (!teacherId) return null
  return await prisma.teacher.findFirst({
    where: { id: teacherId },
    include: {
      school: true,
      signature: true,
      classes: { include: { class: true } },
    },
  })
}
