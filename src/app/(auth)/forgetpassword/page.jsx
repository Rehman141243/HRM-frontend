// 'use client'

// import { Button } from "@/components/ui/button"
// import {
//   Card,
//   CardAction,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label";
// import { useRouter } from "next/navigation";

// export default function ForgotPassword() {
//   const router = useRouter();

//   return (
//     <div className="flex justify-center items-center min-h-screen">
//       <Card className="w-full max-w-md">
        
//         <CardHeader>
//           <CardTitle>Forgot your password?</CardTitle>
//           <CardDescription>
//             Enter your email and we’ll send you a reset link
//           </CardDescription>

//           <CardAction>
//             <Button
//               variant="link"
//               onClick={() => router.push('/login')}
//             >
//               Back to Login
//             </Button>
//           </CardAction>
//         </CardHeader>

//         <CardContent>
//           <form>
//             <div className="flex flex-col gap-6">
//               <div className="grid gap-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="m@example.com"
//                   required
//                 />
//               </div>
//             </div>
//           </form>
//         </CardContent>

//         <CardFooter className="flex-col gap-2">
//           <Button type="submit" className="w-full">
//             Send Reset Link
//           </Button>
//         </CardFooter>

//       </Card>
//     </div>
//   )
// }

'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await forgotPassword({ email });
      setSuccess(data.message || "Reset link sent! Please check your inbox.");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a reset link
          </CardDescription>
          <CardAction>
            <Button variant="link" onClick={() => router.push("/login")}>
              Back to Login
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <form id="forgot-form" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                  {success}
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
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            form="forgot-form"
            className="w-full"
            disabled={loading || !!success}
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}