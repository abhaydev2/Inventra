import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(
    to: string,
    verificationCode: string,
    recipientName: string
) {
    const smtpHost = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER?.trim();
    // Google displays App Passwords with spaces; Nodemailer needs the compact value.
    const smtpPass = process.env.SMTP_PASS?.replace(/\s/g, "");
    const mailFrom = process.env.MAIL_FROM?.trim() || `InventHive <${smtpUser}>`;

    if (!smtpUser || !smtpPass) {
        console.warn("[password-reset] SMTP_USER and SMTP_PASS are not configured. Falling back to console logging.");
        console.log("-----------------------------------------");
        console.log(`[DEVELOPMENT/FALLBACK] Verification code for ${to}: ${verificationCode}`);
        console.log("-----------------------------------------");
        return { sent: true };
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

    try {
        await transporter.sendMail({
            from: mailFrom,
            to,
            subject: "Your InventHive password reset code",
            text: [
                `Dear ${recipientName},`,
                "",
                "We received a request to reset your password.",
                `Your verification code is: ${verificationCode}`,
                "",
                "This code expires in 15 minutes.",
                "If you did not request this, you can ignore this email."
            ].join("\n"),
            html: `<div style="background:#f4f7fb;padding:32px 16px;font-family:Arial,sans-serif;color:#172033"><div style="max-width:560px;margin:auto;background:#fff;border:1px solid #e5eaf2;border-radius:16px;padding:32px"><p>Dear <strong>${recipientName}</strong>,</p><p style="line-height:1.6;color:#526071">We received a request to reset your password. Use the following verification code to proceed:</p><div style="margin:28px 0;padding:24px;text-align:center;background:#f3f4f6;border-radius:12px;color:#2563eb;font-size:38px;font-weight:bold;letter-spacing:12px">${verificationCode}</div><p>This code will expire in 15 minutes.</p><p>If you did not request this password reset, please ignore this email.</p><p style="margin-top:28px">Best regards,<br>The InventHive Team</p><hr style="margin:28px 0;border:0;border-top:1px solid #e5e7eb"><p style="font-size:13px;color:#8a94a3">This is an automated email. Please do not reply to this message.</p></div></div>`
        });
    } catch (error) {
        console.error("[password-reset] SMTP delivery failed", error);
        console.log("-----------------------------------------");
        console.log(`[DEVELOPMENT/FALLBACK] Verification code for ${to}: ${verificationCode}`);
        console.log("-----------------------------------------");
        return { sent: true };
    }

    return { sent: true };
}
