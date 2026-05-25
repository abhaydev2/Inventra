"use client";

import "./login.css";

import Link from "next/link";

import { useEffect } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { FaEye, FaEyeSlash } from "react-icons/fa";

import {
  loginSchema,
  LoginType,
} from "../_component/loginZod";

import { useTogglePassword } from "@/hooks/tooglepassword";

export default function LoginPage() {

  const { showPassword, togglePassword } =
    useTogglePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginType>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  // CLEAR ON LOAD
  useEffect(() => {
    reset({
      email: "",
      password: "",
    });
  }, [reset]);

  const onSubmit = (data: LoginType) => {

    const savedUser =
      localStorage.getItem("user");

    if (!savedUser) {
      alert("Please register first");
      return;
    }

    const userData = JSON.parse(savedUser);

    if (
      data.email === userData.email &&
      data.password === userData.password
    ) {
      alert("Login Successful");

      // ✅ CLEAR FIELDS AFTER LOGIN SUCCESS
      reset({
        email: "",
        password: "",
      });

    } else {
      alert("Invalid Email or Password");
    }
  };

  return (
    <div className="login_page">

      <div className="login_card">

        {/* HEADER */}
        <div className="login_header">

          <h2>Welcome Back</h2>

          <p>
            Login to continue Inventory System
          </p>

        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">

          {/* EMAIL */}
          <div className="input_group">

            <label>Email</label>

            <input
              type="text"
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
                onClick={togglePassword}
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

            <span>
              {errors.password?.message}
            </span>

          </div>

          {/* FORGOT PASSWORD */}
          <div className="forgot">

            <Link href="/forget_password">
              Forgot Password?
            </Link>

          </div>

          {/* LOGIN BUTTON */}
          <button className="btn">
            Login
          </button>

          {/* DIVIDER */}
          <div className="divider">
            <span>OR</span>
          </div>

          {/* GOOGLE BUTTON */}
          <button type="button" className="google_btn">

            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt="google"
            />

            Continue with Google

          </button>

        </form>

        {/* FOOTER */}
        <div className="bottom_text">

          Don&apos;t have account?

          <Link href="/register">
            Register
          </Link>

        </div>

      </div>

    </div>
  );
}