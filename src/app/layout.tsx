import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/ThemeProvider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SchoolPortal',
  description: 'Secondary School Result Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider>{children}</ThemeProvider>
          <Toaster richColors position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  )
}
