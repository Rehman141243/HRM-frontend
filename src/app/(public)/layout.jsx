// "use client"
// import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
// import { AppSidebar } from "@/components/layout/sidebar"

// // export default function Layout({ children }) {
// //   return (
// //     <SidebarProvider defaultOpen={true}>
// //       <AppSidebar />
// //       <SidebarInset>

// //       <main>
// //         <SidebarTrigger />
// //         {children}
// //       </main>
// //       </SidebarInset>
// //     </SidebarProvider>
// //   )
// // }

// // app/layout.tsx or wherever your sidebar layout is

// // import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
// // import { AppSidebar } from "@/components/app-sidebar"

// export default function Layout({ children }) {
//   return (
//     <SidebarProvider>
//       <AppSidebar />
//       <SidebarInset>
//         {/* Topbar with trigger */}
//         <header className="flex h-12 items-center gap-2 px-4 border-b">
//           <SidebarTrigger />
//         </header>
//         <main className="flex-1 p-4">
//           {children}
//         </main>
//       </SidebarInset>
//     </SidebarProvider>
//   )
// }

"use client"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>

        {/* NAVBAR - just trigger */}
        <header className="flex h-12 shrink-0 items-center px-4 border-b">
          <SidebarTrigger className="-ml-1" />
        </header>

        {/* BELOW NAVBAR */}
        <div className="flex flex-col flex-1 p-4 gap-4">

          {/* BREADCRUMB ROW */}
          {/* <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Playground</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb> */}

          {/* PAGE CONTENT */}
          <main className="flex-1">
            {children}
          </main>

        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}