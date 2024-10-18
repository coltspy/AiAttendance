'use client';

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, UserCheck, FileBarChart, Settings, ChevronLeft, ChevronRight, ClipboardCheck } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: UserCheck, label: 'Take Attendance', href: '/attendance' },
    { icon: FileBarChart, label: 'Reports', href: '/reports' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  return (
    <div className={cn(
      "flex flex-col h-screen bg-background border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "flex items-center justify-center h-16 border-b",
        isCollapsed ? "px-2" : "px-4"
      )}>
        {isCollapsed ? (
          <ClipboardCheck className="h-8 w-8 text-primary" />
        ) : (
          <div className="flex items-center space-x-2">
            <ClipboardCheck className="h-8 w-8 text-primary" />
            <span className="text-lg font-semibold">AttendanceAI</span>
          </div>
        )}
      </div>
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 px-2 py-4">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-4 py-3 mb-2 rounded-lg transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              isCollapsed && "justify-center"
            )}
          >
            <item.icon className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && <span className="text-base font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  )
}