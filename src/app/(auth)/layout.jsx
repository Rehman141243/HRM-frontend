
'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated } from "@/lib/auth";

export default function AuthLayout({ children }) {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const [checkComplete, setCheckComplete] = useState(false);

  useEffect(() => {
    // Set a timeout to ensure we don't get stuck in redirecting state
    const timeoutId = setTimeout(() => {
      setRedirecting(false);
      setCheckComplete(true);
    }, 3000);

    if (isAuthenticated()) {
      setRedirecting(true);
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
      setCheckComplete(true);
    }

    return () => clearTimeout(timeoutId);
  }, [router]);

  // Hide content only while actively redirecting an already-logged-in user
  if (redirecting && !checkComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-gray-950 dark:to-gray-900" />
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      {children}
    </div>
  );
}
