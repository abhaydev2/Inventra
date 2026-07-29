"use client";

import "./forgot_password.css";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { requestPasswordReset } from "../../../lib/api/auth";

type ForgotType = {
  email: string;
};

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotType>();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: ForgotType) => {
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await requestPasswordReset(data.email);
      setMessage(response.data.message || "Password reset link sent to your email");
    } catch (error: any) {
      setMessage(error.message || "Could not send reset link");
    } finally {
      setIsSubmitting(false);
    }
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

          <button className="btn" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message ? <p style={{ marginTop: "12px" }}>{message}</p> : null}

        <p className="bottom">
          Back to
          <Link href="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}