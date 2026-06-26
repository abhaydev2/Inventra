"use client";

import "./login.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginSchema, LoginType } from "../_component/loginZod";
import { useTogglePassword } from "@/hooks/tooglepassword";
import { loginAction } from "../_component/authentication_action";

export default function LoginPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const { showPassword, togglePassword } = useTogglePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    reset({ email: "", password: "" });
  }, [reset]);

  // Component → Action → API flow
  const onSubmit = async (data: LoginType) => {
    setApiError("");
    setLoading(true);
    try {
      // Call server action (sets httpOnly cookie internally)
      const result = await loginAction(data.email, data.password);

      if (!result.ok) {
        setApiError(result.error || "Login failed");
        return;
      }

      // Redirect based on role
      if (result.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/user");
      }
    } catch (error: any) {
      setApiError(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login_page">
      <div className="login_card">

        {/* HEADER */}
        <div className="login_header">
          <h2>Welcome Back</h2>
          <p>Login to continue Inventory System</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">

          {/* API ERROR */}
          {apiError && (
            <div className="api_error">{apiError}</div>
          )}

          {/* EMAIL */}
          <div className="input_group">
            <label>Email</label>
            <input
              type="text"
              placeholder="Enter email"
              autoComplete="off"
              {...register("email")}
            />
            <span>{errors.email?.message}</span>
          </div>

          {/* PASSWORD */}
          <div className="input_group">
            <label>Password</label>
            <div className="password_box">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                autoComplete="new-password"
                {...register("password")}
              />
              <button type="button" className="eye_btn" onClick={togglePassword}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <span>{errors.password?.message}</span>
          </div>

          {/* FORGOT */}
          <div className="forgot">
            <Link href="/forget_password">Forgot Password?</Link>
          </div>

          {/* LOGIN BUTTON */}
          <button className="btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* FOOTER */}
        <div className="bottom_text">
          Don&apos;t have account?{" "}
          <Link href="/register">Register</Link>
        </div>

      </div>
    </div>
  );
}
