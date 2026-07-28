"use client";

import "./register.css";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { registerSchema, RegisterType } from "../_component/registerZod";
import { registerAction } from "../_component/authentication_action";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterType>({
    resolver: zodResolver(registerSchema),
  });

  // Component → Action → API flow
  const onSubmit = async (data: RegisterType) => {
    setApiError("");
    setLoading(true);
    try {
      const result = await registerAction({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        username: data.username,
        password: data.password,
        role: data.role,
      });

      if (!result.ok) {
        setApiError(result.error || "Registration failed");
        return;
      }

      reset();
      router.push("/login");
    } catch (error: any) {
      setApiError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register_page">
      <div className="register_card">

        {/* HEADER */}
        <div className="register_header">
          <h2>Create Account</h2>
          <p>Join Inventory Management System</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">

          {/* API ERROR */}
          {apiError && <div className="api_error">{apiError}</div>}

          {/* FIRST NAME */}
          <div className="input_group">
            <label>First Name</label>
            <input
              type="text"
              placeholder="Enter first name"
              autoComplete="off"
              {...register("firstName")}
            />
            <span>{errors.firstName?.message}</span>
          </div>

          {/* LAST NAME */}
          <div className="input_group">
            <label>Last Name</label>
            <input
              type="text"
              placeholder="Enter last name"
              autoComplete="off"
              {...register("lastName")}
            />
            <span>{errors.lastName?.message}</span>
          </div>

          {/* USERNAME */}
          <div className="input_group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              autoComplete="off"
              {...register("username")}
            />
            <span>{errors.username?.message}</span>
          </div>

          {/* EMAIL */}
          <div className="input_group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter email"
              autoComplete="off"
              {...register("email")}
            />
            <span>{errors.email?.message}</span>
          </div>

          {/* PHONE */}
          <div className="input_group">
            <label>Phone Number</label>
            <input
              type="text"
              placeholder="Enter phone number"
              autoComplete="off"
              {...register("phone")}
            />
            <span>{errors.phone?.message}</span>
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
              <button
                type="button"
                className="eye_btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <span>{errors.password?.message}</span>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="input_group">
            <label>Confirm Password</label>
            <div className="password_box">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                className="eye_btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <span>{errors.confirmPassword?.message}</span>
          </div>

          {/* REGISTER AS ROLE */}
          <div className="input_group">
            <label>Register As</label>
            <select
              {...register("role")}
              defaultValue="user"
            >
              <option value="user">Standard User</option>
              <option value="admin">Administrator</option>
            </select>
            <span>{errors.role?.message}</span>
          </div>

          {/* REGISTER BUTTON */}
          <button className="register_btn" disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </button>

        </form>

        {/* FOOTER */}
        <div className="bottom_text">
          Already have an account?{" "}
          <Link href="/login">Login</Link>
        </div>

      </div>
    </div>
  );
}
