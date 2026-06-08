'use client'

import { useClerk } from '@clerk/nextjs'

export default function StudentSignOutButton() {
  const { signOut } = useClerk()

  return (
    <button
      onClick={() => signOut({ redirectUrl: '/student-setup' })}
      className="text-xs text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
    >
      Sign out
    </button>
  )
}
