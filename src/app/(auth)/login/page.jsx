
'use client'

import { useState } from "react";
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
import { signin, getUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signin({ email, password });
      const user = getUser();


      // If your backend returns role field:
      if (user?.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user?.role === "user" && user?.designation === "hr") {
        router.push("/hr");
      } else if (user?.role === "user" && user?.designation === "manager") {
        router.push("/manager");
      } else {
        router.push("/employee/attendance");
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        // User does not exist in database
        setError("You are not allowed to enter.");
      } else if (err?.response?.status === 401) {
        // User found but password is wrong
        setError("Please check your credentials, they do not match.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
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
              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

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
                  <a
                    href="/forgetpassword"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
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