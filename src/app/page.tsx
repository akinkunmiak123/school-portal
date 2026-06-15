'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  BookOpen,
  Users,
  ClipboardList,
  Shield,
  ArrowRight,
  Check,
  Menu,
  X,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function HomePage() {
    const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base">SchoolPortal</span>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-1 text-sm">
            <ThemeToggle />

            <Link
              href="/student-setup"
              className="px-3 py-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              Student
            </Link>

            <Link
              href="/teacher-login"
              className="px-3 py-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              Teachers
            </Link>

            <Link
              href="/dashboard"
              className="ml-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg"
            >
              Admin
            </Link>
          </div>

          {/* Mobile button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="flex flex-col p-4 space-y-3">
              <ThemeToggle />

              <Link
                href="/student-setup"
                className="py-2"
                onClick={() => setIsOpen(false)}
              >
                Student
              </Link>

              <Link
                href="/teacher-login"
                className="py-2"
                onClick={() => setIsOpen(false)}
              >
                Teachers
              </Link>

              <Link
                href="/dashboard"
                className="py-2 px-4 bg-blue-600 text-white rounded-lg text-center"
                onClick={() => setIsOpen(false)}
              >
                Admin
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-6">
            <span className="w-4 h-px bg-blue-600 dark:bg-blue-400" />
            School Management Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 dark:text-white mb-6 leading-[0.95]">
            The smarter way
            <br />
            to run your
            <br />
            <span className="text-blue-600 dark:text-blue-400">school.</span>
          </h1>

          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mb-10 leading-relaxed">
            Results, fees, teachers and students — managed from one clean
            dashboard. Built for Nigerian secondary schools.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/teacher-login"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              Teacher login
            </Link>
          </div>
        </div>
      </section>

      {/* Portal cards */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-8">
            Three portals, one platform
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Shield,
                role: 'Admin',
                tagline: 'Full control',
                desc: 'Manage classes, students, teachers, results and fee approvals.',
                href: '/dashboard',
                cta: 'Admin login',
                accent: 'bg-blue-600 hover:bg-blue-700',
                light:
                  'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
              },
              {
                icon: Users,
                role: 'Teacher',
                tagline: 'Score entry',
                desc: 'Enter CA, midterm and exam scores. Add remarks. Upload your signature.',
                href: '/teacher-login',
                cta: 'Teacher login',
                accent:
                  'bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600',
                light:
                  'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
              },
              {
                icon: GraduationCap,
                role: 'Student',
                tagline: 'View results',
                desc: 'Upload fee receipts and access your term results and report card.',
                href: '/student-setup',
                cta: 'Student portal',
                accent: 'bg-blue-600 hover:bg-blue-700',
                light:
                  'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
              },
            ].map((p) => (
              <div
                key={p.role}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 flex flex-col transition-colors duration-300"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${p.light}`}
                >
                  <p.icon className="w-5 h-5" />
                </div>
                <div className="mb-1">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    {p.role}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                  {p.tagline}
                </h3>
                <p className="text-sm text-gray-400 dark:text-gray-400 leading-relaxed flex-1 mb-6">
                  {p.desc}
                </p>
                <Link
                  href={p.href}
                  className={`inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${p.accent}`}
                >
                  {p.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-sm mb-16">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">
              Features
            </p>
            <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
              Everything a school needs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            {[
              {
                icon: ClipboardList,
                title: 'Smart results entry',
                desc: 'CA, midterm and exam scores auto-calculate totals and grades based on your custom grading scale.',
              },
              {
                icon: BookOpen,
                title: 'Department management',
                desc: 'Assign SS students to Science, Arts or Commercial with department, vocational and optional subjects.',
              },
              {
                icon: Shield,
                title: 'Fee gate',
                desc: 'Students upload payment receipts. Admin approves or rejects. Results unlock only after approval.',
              },
              {
                icon: Users,
                title: 'Teacher roles',
                desc: 'Class teachers handle their arms. Year tutors oversee all arms in their level. Both enter scores.',
              },
              {
                icon: GraduationCap,
                title: 'PDF report cards',
                desc: 'Auto-generated report cards with teacher remark, teacher signature and principal signature.',
              },
              {
                icon: ClipboardList,
                title: 'OTP secure login',
                desc: 'Teachers and students verify identity via one-time passwords sent to their registered email.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white dark:bg-gray-900 p-6 flex gap-4 transition-colors duration-300"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                  <f.icon className="w-[18px] h-[18px] text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-sm mb-16">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
              Up in 3 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                n: '1',
                title: 'Set up your school',
                desc: 'Register, add your school details, configure classes, subjects and grading scale.',
              },
              {
                n: '2',
                title: 'Add people',
                desc: 'Import students via CSV. Add teachers and assign them to classes. Credentials auto-generated.',
              },
              {
                n: '3',
                title: 'Go live',
                desc: 'Teachers enter results. Students pay fees and view results. Admin oversees everything.',
              },
            ].map((s) => (
              <div key={s.n} className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-black flex items-center justify-center">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {s.title}
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-24 px-6 bg-white dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">
                What's included
              </p>
              <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-6">
                Built for the way Nigerian schools work
              </h2>
              <p className="text-gray-400 dark:text-gray-400 leading-relaxed mb-8">
                From JSS 1 to SS 3, primary to secondary — the platform
                understands Nigerian school structure out of the box.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
              >
                Create your school
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {[
                'JSS and SS class structure with arms',
                'WAEC-style grading (A1–F9) configurable',
                'Department system for SS (Science, Arts, Commerce)',
                'Term and session management',
                'Fee receipt upload and approval',
                'OTP email verification for all users',
                'PDF report cards with signatures',
                'School activities and notices for students',
                'CSV bulk import for students',
                'Year tutor and class teacher roles',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-24 px-6 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Ready to get started?
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-lg mx-auto">
            Set up your school in minutes. No technical knowledge required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors text-sm"
            >
              Create free account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/teacher-login"
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors text-sm"
            >
              Teacher login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  SchoolPortal
                </span>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
                Smart school management for Nigerian secondary schools.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-3">
                  Portals
                </p>
                <div className="space-y-2">
                  <Link
                    href="/sign-in"
                    className="block text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Admin
                  </Link>
                  <Link
                    href="/teacher-login"
                    className="block text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Teacher
                  </Link>
                  <Link
                    href="/sign-up"
                    className="block text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Student
                  </Link>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-3">
                  Account
                </p>
                <div className="space-y-2">
                  <Link
                    href="/sign-up"
                    className="block text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/sign-in"
                    className="block text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/student-setup"
                    className="block text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Activate account
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-300 dark:text-gray-600">
              © {new Date().getFullYear()} SchoolPortal. Built for Nigerian
              schools.
            </p>
            <p className="text-xs text-gray-300 dark:text-gray-600">
              Powered by Next.js · Clerk · Supabase
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
