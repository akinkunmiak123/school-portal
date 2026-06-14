import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/teacher-login(.*)',
  '/teacher-portal(.*)',
  '/api/teacher(.*)',
  '/api/student(.*)',
  '/api/upload(.*)', 
  '/api/payments(.*)', 
  '/api/report-card(.*)', 
  '/student-setup(.*)',
  '/portal(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/(api|trpc)(.*)'],
}
