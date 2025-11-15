// app/auth/signup/page.jsx
"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    storename: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.storename || formData.storename.length < 3) {
      newErrors.storename = "Store name must be at least 3 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Create account
      const signupResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          storename: formData.storename,
        }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        setErrors({ submit: signupData.error || "Failed to create account" });
        setLoading(false);
        return;
      }

      // Auto sign-in after successful signup
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setErrors({
          submit:
            "Account created but sign-in failed. Please try signing in manually.",
        });
        setLoading(false);
        return;
      }

      // Redirect to onboarding
      router.push("/onboarding");
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, submit: undefined }));
  };

  return (
    <>
      <div
        className="flex min-h-full flex-1 dark:from-zinc-900 dark:to-zinc-800 sm:bg-none relative overflow-hidden"
        style={{
          backgroundImage: "url(/portrait.avif)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Light theme overlay - white to transparent */}
        <div className="absolute inset-0 bg-zinc-50/50 dark:hidden sm:hidden" />

        {/* Dark theme overlay */}
        <div className="absolute inset-0 bg-zinc-900/80 hidden dark:block sm:hidden" />


        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 sm:bg-white dark:sm:bg-zinc-950 relative z-10">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            

            <div className="mt-8">
              <Card className="w-full border-none bg-zinc-300/30 backdrop-blur-md dark:bg-zinc-900/30">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Sign up</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Create an account to list products and manage your store
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* OAuth Buttons */}
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        signIn("google", { callbackUrl: "/onboarding" })
                      }
                      type="button"
                    >
                      <FcGoogle className="h-5 w-5 mr-3" />
                      Continue with Google
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        signIn("facebook", { callbackUrl: "/onboarding" })
                      }
                      type="button"
                    >
                      <FaFacebook className="h-5 w-5 mr-3 text-blue-600" />
                      Continue with Facebook
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 py-1 rounded text-muted-foreground">
                        Or sign up with email
                      </span>
                    </div>
                  </div>

                  {/* Signup Form (same as before) */}
                  <div className="space-y-4">
                    {errors.submit && (
                      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                        {errors.submit}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="storename">Store Name</Label>
                      <Input
                        id="storename"
                        type="text"
                        placeholder="My Awesome Store"
                        value={formData.storename}
                        onChange={(e) =>
                          handleChange("storename", e.target.value)
                        }
                        className={errors.storename ? "border-red-500" : ""}
                      />
                      {errors.storename && (
                        <p className="text-sm text-red-500">
                          {errors.storename}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="At least 8 characters"
                          value={formData.password}
                          onChange={(e) =>
                            handleChange("password", e.target.value)
                          }
                          className={
                            errors.password ? "border-red-500 pr-10" : "pr-10"
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-500">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleChange("confirmPassword", e.target.value)
                        }
                        className={
                          errors.confirmPassword ? "border-red-500" : ""
                        }
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleSubmit}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By signing up, you agree to our{" "}
                      <Link
                        href="/policies/terms"
                        className="underline hover:text-foreground"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/policies/privacy"
                        className="underline hover:text-foreground"
                      >
                        Privacy Policy
                      </Link>
                    </p>
                  </div>

                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">
                      Already have an account?{" "}
                    </span>
                    <Link
                      href="/auth/signin"
                      className="text-emerald-600 hover:underline font-medium"
                    >
                      Sign in
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="relative hidden w-0 flex-1 lg:block">
          <img
            alt=""
            src="/cover-image.jpg"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-zinc-100/90 via-transparent to-transparent dark:from-zinc-900/90" />
        </div>
      </div>
    </>
  );
}
