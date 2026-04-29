


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
import { isAuthenticated, signout } from "@/lib/auth";
import { DoorOpen } from "lucide-react";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      router.replace("/login");
    } else {
      // User is authenticated, ready to render
      setIsReady(true);
    }
  }, [router]);

  // Show nothing while checking authentication
  if (!isReady) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          {/* <Separator orientation="vertical" className="h-6" /> */}
          <div className="min-w-0 flex-1" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="cursor-pointer p-1 rounded-sm border">

              <DoorOpen
                className="ml-auto size-4 opacity-60 text-black dark:text-white"
                onClick={() => signout()}
              />
            </span>
          </div>
        </header>
        <div className="flex flex-1 flex-col p-4 sm:p-6 gap-6">
          <main className="flex-1">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}