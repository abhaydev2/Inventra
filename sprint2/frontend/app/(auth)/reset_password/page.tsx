"use client";

import "./reset_password.css";

import Link from "next/link";

import { useForm } from "react-hook-form";

type ResetType = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetType>();

  const onSubmit = (data: ResetType) => {
    console.log(data);
    alert("Password Reset Successful");
  };

  return (
    <div className="rp_page">

      <div className="rp_card">

        <h2>Reset Password</h2>

        <p>Create a new password</p>

        <form onSubmit={handleSubmit(onSubmit)}>

          <div className="input_group">
            <label>New Password</label>

            <input
              type="password"
              placeholder="Enter new password"
              {...register("password", {
                required: "Password required",
              })}
            />

            <span>{errors.password?.message}</span>
          </div>

          <div className="input_group">
            <label>Confirm Password</label>

            <input
              type="password"
              placeholder="Confirm password"
              {...register("confirmPassword", {
                required: "Confirm password required",
              })}
            />

            <span>
              {errors.confirmPassword?.message}
            </span>
          </div>

          <button className="btn">
            Reset Password
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