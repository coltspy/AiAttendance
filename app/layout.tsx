'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isLandingPage = pathname === '/'
  const shouldShowSidebar = !isAuthPage && !isLandingPage

  return (
    <html lang="en">
      <body className={inter.className}>
        {shouldShowSidebar ? (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
              {children}
            </main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  )
}