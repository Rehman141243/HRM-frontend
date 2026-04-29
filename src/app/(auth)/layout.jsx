
'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated } from "@/lib/auth";

export default function AuthLayout({ children }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // If user is already authenticated, redirect to their dashboard
    if (isAuthenticated()) {
      const user = getUser();
      
      if (user?.role === "admin") {
        router.replace("/admin/dashboard");
      } else if (user?.role === "user") {
        const designation = user?.designation?.toLowerCase();
        
        if (designation === "hr") {
          router.replace("/hr/attendance");
        } else if (designation === "manager") {
          router.replace("/manager/attendance");
        } else {
          router.replace("/employee/attendance");
        }
      } else {
        router.replace("/employee/attendance");
      }
    } else {
      // User is not authenticated, show login page
      setIsReady(true);
    }
  }, [router]);

  // Show nothing while checking authentication
  if (!isReady) {
    return null;
  }

  return (
    <div>
      <span className="min-h-full flex flex-col">{children}</span>
    </div>
  );
}
