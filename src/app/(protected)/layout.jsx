


// 'use client'
// import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
// import { AppSidebar } from "@/components/layout/sidebar";
// import ThemeToggle from "@/components/common/theme-toggle";
// import { useCallback, useEffect } from "react";
// import { Separator } from "@/components/ui/separator";
// import { useRouter } from "next/navigation";
// import {  getUser } from "@/lib/auth";
// export default function ProtectedLayout({ children }) {
//   const router = useRouter()
//   const user = getUser();

//   useEffect(() => {
//     if (!user) {
//       router.replace("/login");
//     }
//   }, [user]);

//   if (typeof window !== "undefined" && !user) {
//     return null;
//   }

//   return (
//     // <SidebarProvider>
//     //   <AppSidebar />
//     //   <SidebarInset>
//     //     <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
//     //       <SidebarTrigger className="-ml-1" />
//     //       <Separator orientation="vertical" className="h-6" />
//     //       <div className="min-w-0 flex-1">

//     //       </div>
//     //       <div className="flex items-center gap-2">
//     //         <ThemeToggle />
//     //       </div>
//     //     </header>

//     //     <div className="flex flex-1 flex-col p-4 sm:p-6 gap-6">
//     //       <main className="flex-1">{children}</main>
//     //     </div>
//     //   </SidebarInset>
//     // </SidebarProvider>
//     <SidebarProvider>
//     <AppSidebar />
//     <SidebarInset>
//       <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
//         <SidebarTrigger className="-ml-1" />
//         <Separator orientation="vertical" className="h-6" />
//         <div className="min-w-0 flex-1" />
//         <div className="flex items-center gap-2">
//           <ThemeToggle />
//         </div>
//       </header>
//       <div className="flex flex-1 flex-col p-4 sm:p-6 gap-6">
//         <main className="flex-1">{children}</main>
//       </div>
//     </SidebarInset>
//   </SidebarProvider>
//   );
// }

'use client'
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import ThemeToggle from "@/components/common/theme-toggle";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, []);




  if (!ready) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6" />
          <div className="min-w-0 flex-1" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col p-4 sm:p-6 gap-6">
          <main className="flex-1">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}