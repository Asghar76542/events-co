'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  BarChart3,
  Users,
  Calendar,
  LogOut,
  PanelLeft,
} from 'lucide-react'
import Link from 'next/link'
import { Toaster } from '@/components/ui/toaster'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
  },
  {
    name: 'Management',
    href: '/admin/management',
    icon: Users,
  },
]

function ProtectedAdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!isMounted) return
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          router.push('/admin/login')
        }
      } catch (error) {
        router.push('/admin/login')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout failed:', error)
      router.push('/admin/login')
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Calendar className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">EventsCo Admin</span>
                <span className="text-xs text-muted-foreground">Management Panel</span>
              </div>
            </div>
            <SidebarTrigger className="size-8 text-muted-foreground hover:text-foreground" />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <NavigationMenu />
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src="" alt={user.username} />
                      <AvatarFallback className="rounded-lg">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.username}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.role}</span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src="" alt={user.username} />
                        <AvatarFallback className="rounded-lg">
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user.username}</span>
                        <span className="truncate text-xs text-muted-foreground">{user.role}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Toggle menu</span>
            <span className="text-xs text-muted-foreground/80">(Ctrl/Cmd+B)</span>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
          <div className="min-h-0 flex-1">
            {children}
          </div>
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}

function NavigationMenu() {
  const { toggleSidebar } = useSidebar()

  return (
    <SidebarMenu>
      {navigation.map((item) => (
        <SidebarMenuItem key={item.name}>
          <SidebarMenuButton asChild>
            <Link href={item.href}>
              <item.icon className="size-4" />
              <span>{item.name}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
      <SidebarMenuItem className="pt-4 border-t border-sidebar-border mt-4">
        <SidebarMenuButton asChild>
          <button type="button" onClick={toggleSidebar} className="flex items-center gap-2 text-sm font-medium">
            <PanelLeft className="size-4" />
            <span>Hide menu</span>
          </button>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return <ProtectedAdminShell>{children}</ProtectedAdminShell>
}
