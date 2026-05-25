export type AuthMode = "login" | "register" | "forgot-password" | "reset-password";

export async function loginAction(formData: FormData) {
  return {
    ok: true,
    mode: "login" as const,
    values: Object.fromEntries(formData.entries()),
  };
}

export async function registerAction(formData: FormData) {
  return {
    ok: true,
    mode: "register" as const,
    values: Object.fromEntries(formData.entries()),
  };
}

export async function forgotPasswordAction(formData: FormData) {
  return {
    ok: true,
    mode: "forgot-password" as const,
    values: Object.fromEntries(formData.entries()),
  };
}

export async function resetPasswordAction(formData: FormData) {
  return {
    ok: true,
    mode: "reset-password" as const,
    values: Object.fromEntries(formData.entries()),
  };
}
