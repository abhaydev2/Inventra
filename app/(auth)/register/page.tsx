"use client";

import "./register.css";

import Link from "next/link";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { FaEye, FaEyeSlash } from "react-icons/fa";

import {
  registerSchema,
  RegisterType,
} from "../_component/registerZod";

export default function RegisterPage() {

  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterType>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterType) => {

    localStorage.setItem(
      "user",
      JSON.stringify(data)
    );

    alert("Account Created Successfully");

    reset();

    // GO TO LOGIN PAGE
    router.push("/login");
  };

  return (
    <div className="register_page">

      <div className="register_card">

        {/* HEADER */}
        <div className="register_header">

          <h2>Create Account</h2>

          <p>
            Join Inventory Management System
          </p>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >

          {/* FULL NAME */}
          <div className="input_group">

            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter your name"
              autoComplete="off"
              {...register("fullName")}
            />

            <span>
              {errors.fullName?.message}
            </span>

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

            <span>
              {errors.email?.message}
            </span>

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

            <span>
              {errors.password?.message}
            </span>

          </div>

          {/* CONFIRM PASSWORD */}
          <div className="input_group">

            <label>Confirm Password</label>

            <div className="password_box">

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />

              <button
                type="button"
                className="eye_btn"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                {showConfirmPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

            <span>
              {errors.confirmPassword?.message}
            </span>

          </div>

          {/* REGISTER BUTTON */}
          <button className="register_btn">
            Register
          </button>

        </form>

        {/* FOOTER */}
        <div className="bottom_text">

          Already have an account?

          <Link href="/login">
            Login
          </Link>

        </div>

      </div>

    </div>
  );
}