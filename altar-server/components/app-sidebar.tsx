"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart3, Settings, Store, LogOut, ChevronUp, ShoppingBag } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navMain = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Checkout",
    url: "/pos",
    icon: ShoppingCart,
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Package,
  },
  {
    title: "Carts",
    url: "/pos/carts",
    icon: ShoppingBag,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: BarChart3,
  },
]

const navSecondary = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
const pathname = usePathname()
  const [user, setUser] = React.useState<{ name: string; email: string; avatar?: string } | null>(null)

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        console.log("Auth response:", data)
        
        if (res.ok && data.user) {
          console.log("Setting user:", data.user)
          setUser(data.user)
        } else {
          console.warn("Failed to load user:", data.error)
        }
      } catch (err) {
        console.error("Failed to load user", err)
      }
    }
    fetchUser()
  }, [])

  const isActive = (url: string) => {
    if (url === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(url)
  }

 

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <a href="/" className="flex items-center gap-2">
                <Store className="size-5" />
                <span className="text-lg font-bold">SwiftPOS</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="sm">
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full" size="sm">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {user?.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.name || "User Avatar"} />
                      ) : (
                        <AvatarFallback>{user?.name ? user.name.charAt(0) : "U"}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium leading-none">{user?.name || "User"}</span>
                      <span className="text-xs text-muted-foreground leading-none">{user?.email || "Unknown"}</span>
                    </div>
                    <ChevronUp className="ml-auto size-4" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg">
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
