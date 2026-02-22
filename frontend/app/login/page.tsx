"use client";

import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

/** Login screen: email/password with show/hide, uses AuthContext.login */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    document.title = "Sign In | Notes App";
  }, []);

  /** Handle login form submit */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Failed to login. Please check your credentials."
      );
      setTimeout(() => setError(""), 5000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-4 md:mb-6">
          <Image src="/signin_cactus.svg" alt="Cute cactus" width={192} height={192} className="w-32 md:w-48 h-auto" sizes="(max-width: 768px) 8rem, 12rem" priority={false} />
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-center mb-6 md:mb-8 text-[#88642A]">
          Welcome Back!
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full rounded-full border-2 border-[#88642A] bg-transparent focus:outline-none focus:border-[#88642A]"
              required
            />
          </div>

          <div className="form-control relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full rounded-full pr-16 border-2 border-[#88642A] bg-transparent focus:outline-none focus:border-[#88642A]"
              required
            />
            <div
              className="tooltip tooltip-left absolute right-4 top-1/2 -translate-y-1/2"
              data-tip={showPassword ? "Hide password" : "Show password"}
            >
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#88642A] hover:text-[#6b4e21]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn w-full rounded-full border-2 border-[#88642A] bg-transparent text-[#88642A] hover:bg-[#88642A] hover:text-white transition-all"
          >
            Sign In
          </button>

          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="link text-[#78ABA8] hover:text-[#6a9d9a]"
            >
              Sign Up
            </Link>
          </div>
        </form>
      </div>

      {error && (
        <div className="toast toast-end toast-bottom">
          <div className="alert alert-error bg-red-100 border-2 border-red-500 text-red-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
