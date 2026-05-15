import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import TeacherLoginForm from './_components/TeacherLoginForm'

export default async function TeacherLoginPage() {
  const { userId } = await auth()

  if (userId) {
    // If already logged in check if teacher
    const teacher = await prisma.teacher.findFirst({
      where: { clerkUserId: userId },
    })
    if (teacher) redirect('/teacher-portal')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">T</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Teacher Portal
          </h1>
          <p className="text-gray-500 mt-2">
            Sign in with your school-provided credentials
          </p>
        </div>
        <TeacherLoginForm />
      </div>
    </div>
  )
}
