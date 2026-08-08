"use client";

import "../forget_password/forgot_password.css";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { requestPasswordReset, verifyPasswordResetCode } from "../../../lib/api/auth";

type VerificationForm = {
  code: string;
};

export default function VerifyResetCodePage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationForm>();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const getEmail = () => {
    const queryEmail = new URLSearchParams(window.location.search).get("email");
    return (queryEmail || sessionStorage.getItem("passwordResetEmail") || "")
      .trim()
      .toLowerCase();
  };

  const onSubmit = async ({ code }: VerificationForm) => {
    const email = getEmail();
    if (!email) {
      setMessage("Your email is missing. Please start the password reset again.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      const response = await verifyPasswordResetCode(email, code);
      sessionStorage.setItem("passwordResetToken", response.data.resetToken);
      router.push("/reset_password");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Could not verify the code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendCode = async () => {
    const email = getEmail();
    if (!email) {
      setMessage("Your email is missing. Please start the password reset again.");
      return;
    }

    setIsResending(true);
    setMessage("");
    try {
      const response = await requestPasswordReset(email);
      setMessage(response.message || "A new verification code was sent");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Could not resend the code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fp_page">
      <div className="fp_card">
        <h2>Verify Your Email</h2>
        <p>Enter the 6-digit verification code sent to your email</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input_group">
            <label>Verification Code</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="Enter 6-digit code"
              {...register("code", {
                required: "Verification code required",
                pattern: {
                  value: /^\d{6}$/,
                  message: "Enter the 6-digit verification code",
                },
              })}
            />
            <span>{errors.code?.message}</span>
          </div>

          <button className="btn" disabled={isSubmitting || isResending}>
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        {message ? <p className="status_message">{message}</p> : null}

        <button
          className="text_button"
          type="button"
          disabled={isSubmitting || isResending}
          onClick={resendCode}
        >
          {isResending ? "Sending..." : "Resend code"}
        </button>

        <p className="bottom">
          Change email?
          <Link href="/forget_password">Go back</Link>
        </p>
      </div>
    </div>
  );
}
