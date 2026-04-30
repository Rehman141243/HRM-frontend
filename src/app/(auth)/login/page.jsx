
'use client'

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { signin } from "@/lib/auth";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await signin({ email, password });
      const user = response?.user;

      if (!user) {
        setError("Login response invalid. Please try again.");
        setLoading(false);
        return;
      }

      // Give localStorage a moment to sync
      await new Promise(resolve => setTimeout(resolve, 100));

      // Route users based on their role
      if (user?.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user?.role === "user") {
        // For non-admin users, check designation
        const designation = user?.designation?.toLowerCase();
        
        if (designation === "hr") {
          router.push("/hr/attendance");
        } else if (designation === "manager") {
          router.push("/manager/attendance");
        } else {
          // Default route for employees
          router.push("/employee/attendance");
        }
      } else {
        // Fallback for any other role
        router.push("/employee/attendance");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err?.response?.status === 404) {
        // User does not exist in database
        setError("You are not allowed to enter.");
      } else if (err?.response?.status === 401) {
        // User found but password is wrong
        setError("Please check your credentials, they do not match.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Use the credentials provided by your administrator
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id="login-form" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {/* <a
                    href="/forgetpassword"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a> */}
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            form="login-form"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Logging in…" : "Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}