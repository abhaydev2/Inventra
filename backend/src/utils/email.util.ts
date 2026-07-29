import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(to: string, resetLink: string) {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const mailFrom = process.env.MAIL_FROM || smtpUser || "no-reply@inventory.local";

    if (!smtpHost || !smtpUser || !smtpPass) {
        console.warn(`[password-reset] SMTP not configured. Reset link: ${resetLink}`);
        return { sent: false, previewUrl: resetLink };
    }

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
            user: smtpUser,
            pass: smtpPass
        }
    });

    await transporter.sendMail({
        from: mailFrom,
        to,
        subject: "Reset your password",
        html: `<p>You requested a password reset.</p><p>Use the link below to set a new password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, you can ignore this email.</p>`
    });

    return { sent: true };
}
