
"use client"

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarHeader, SidebarMenu, SidebarMenuItem,
  SidebarMenuButton, SidebarRail,
} from "@/components/ui/sidebar"
import {
  Banknote,
  BarChart2,
  Calendar,
  CalendarDays,
  CalendarClock,
  ClipboardCheck,
  Clock,
  Coins,
  Gavel,
  LayoutDashboard,
  LogOut,
  Timer,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getUser } from "@/lib/auth"
import { useEffect, useState } from "react"


export function AppSidebar() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter();
  const getDefaultRoute = () => {
    if (role === "admin") return "/admin/employee-management"

    if (designation === "employee") return "/employee/attendance"

    if (designation === "hr") return "/hr/attendance"

    if (designation === "manager") return "/manager/attendance"

    return "/login"
  }
  useEffect(() => {
    const u = getUser()
    console.log("USER DATA:", u)
    setUser(u)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    const path = window.location.pathname

    if (!canAccess(path)) {
      router.push(getDefaultRoute())
    }

  }, [user, loading])



  const allNavItems = [
    { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, admin: true },
    { title: "Employee Management", href: "/admin/employee-management", icon: Users, admin: true },
    { title: "Shift Management", href: "/admin/shift-management", icon: Calendar, hr: true },
    { title: "Leave Approval", href: "/admin/leave-approval", icon: ClipboardCheck, admin: true },
    { title: "Overtime Requests", href: "/admin/overtime-request", icon: Timer, admin: true },
    { title: "Policies & Structure", href: "/admin/policies-structure", icon: Gavel, admin: true },
    { title: "Reports", href: "/admin/reports", icon: BarChart2, admin: true },
    { title: "Payroll", href: "/admin/payroll", icon: Wallet, admin: true },



    { title: "Attendance", href: "/employee/attendance", icon: Clock, employeeOnly: true },
    { title: "Leave", href: "/employee/leave", icon: CalendarDays, employeeOnly: true },
    { title: "My Shifts", href: "/employee/shift", icon: CalendarClock, employeeOnly: true },
    { title: "Overtime Request", href: "/employee/overtime", icon: Timer, employeeOnly: true },
    { title: "Salary Structure", href: "/employee/salary-structure", icon: Banknote, employeeOnly: true },
    { title: "Payroll", href: "/employee/payroll", icon: Coins, employeeOnly: true },
    //hr
    { title: "My Attendance", href: "/hr/attendance", icon: Clock, hr: true },
    { title: "Employee Management", href: "/hr/employee-management", icon: Users, hr: true },
    { title: "Shift Management", href: "/hr/shift-management", icon: Calendar, hr: true },
    { title: "Leave Approval", href: "/hr/leave-approval", icon: ClipboardCheck, hr: true },
    { title: "Overtime Requests", href: "/hr/overtime-request", icon: Timer, hr: true },
    { title: "Policies & Structure", href: "/hr/policies-structure", icon: Gavel, hr: true },
    { title: "Reports", href: "/hr/reports", icon: BarChart2, hr: true },
    { title: "Payroll", href: "/hr/payroll", icon: Wallet, hr: true },


    //manager
    { title: "My Attendance", href: "/manager/attendance", icon: Clock, manager: true },
    { title: "Leave Approval", href: "/manager/leave-approval", icon: ClipboardCheck, manager: true },
    { title: "Overtime Request", href: "/manager/overtime", icon: Timer, manager: true },
    { title: "Payroll", href: "/manager/payroll", icon: Wallet, manager: true },




  ]

  const role = (user?.role ?? "").toLowerCase()
  const designation = (user?.designation ?? "").toLowerCase()
  const canAccess = (path) => {
    // 🔴 ADMIN RULE
    if (role === "admin") {
      return (
        path !== "/employee/attendance" &&
        path !== "/hr/attendance" &&    // My Attendance (HR)
        path !== "/manager/attendance" && // My Attendance (Manager)
        path !== "/hr/leave"            // My Leave
      )
    }

    // 🟢 USER ROLE
    if (role === "user") {

      // ✅ employee → allow ALL /employee/*
      if (designation === "employee") {
        return path.startsWith("/employee/")
      }

      // ✅ hr + manager → ALL pages
      if (designation === "hr" || designation === "manager") {
        return true
      }
    }

    return false
  }
  const navItems = allNavItems.filter((item) => {
    const role = (user?.role ?? "").toLowerCase()
    const designation = (user?.designation ?? "").toLowerCase()

    // 🔴 ADMIN → explicit allowed list (BEST PRACTICE)
    if (role === "admin") {
      const adminAllowed = [
        // "/dashboard",
        "/admin/dashboard",
        "/admin/policies-structure",
        "/admin/policies",
        "/admin/employee-management",
        "/admin/shift-management",
        "/admin/policies-structure/salary-structure",
        "/admin/leave-approval",
        "/admin/change-shift",
        "/admin/overtime-request",
        "/admin/reports",
        "/admin/payroll",
        "/admin/shift-request",
      ]

      return adminAllowed.includes(item.href)
    }

    // 👤 EMPLOYEE
    if (designation === "employee") {
      return item.href.startsWith("/employee/")
    }

    // 🟣 HR
    if (designation === "hr") {
      return (
        item.href.startsWith("/hr/") ||
        item.href === "/hr/employee-management" ||
        item.href === "/hr/shift-management" ||
        item.href === "/hr/attendance"
      )
    }

    // 🟡 MANAGER
    if (designation === "manager") {
      return (
        item.href.startsWith("/manager/") ||
        // item.href === "/manager/employee-management" ||
        // item.href === "/shift-management" ||
        item.href === "/manager/attendance"
      )
    }

    return false
  })
  //const navItems = allNavItems.filter(item => item.roles.includes(role))

  const initials = (user?.name ?? user?.email ?? "?")
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const displayName = user?.name ?? user?.email ?? "User"
  const displayEmail = user?.email ?? ""

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar collapsible="icon">

        {/* HEADER */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="HRM">
                <div className="size-8 rounded-md bg-linear-to-br from-teal-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  H
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-semibold text-sm">HRM Suite</span>
                  <span className="text-xs text-muted-foreground">Operations</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* NAV */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        {/* FOOTER — shows real user */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip={displayName}>
                <div className="size-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {initials}
                </div>
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-sm font-medium truncate">{displayName}</span>
                  <span className="text-xs text-muted-foreground truncate">{displayEmail}</span>
                </div>

              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  )
}