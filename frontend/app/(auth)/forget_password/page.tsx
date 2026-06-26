"use client";

import "./forgot_password.css";

import Link from "next/link";

import { useForm } from "react-hook-form";

type ForgotType = {
  email: string;
};

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotType>();

  const onSubmit = (data: ForgotType) => {
    console.log(data);
    alert("Reset link sent to email");
  };

  return (
    <div className="fp_page">

      <div className="fp_card">

        <h2>Forgot Password</h2>

        <p>Enter your email to reset password</p>

        <form onSubmit={handleSubmit(onSubmit)}>

          <div className="input_group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              {...register("email", {
                required: "Email required",
              })}
            />

            <span>{errors.email?.message}</span>
          </div>

          <button className="btn">
            Send Reset Link
          </button>

        </form>

        <p className="bottom">
          Back to

          <Link href="/login">
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}