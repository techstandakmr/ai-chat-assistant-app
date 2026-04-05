import nodemailer from "nodemailer";
import axios from "axios";
export const otpEmailTemplate = (name, otp) => {
    return `
    <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">
        <div style="max-width:500px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.05);">
            
            <div style="background:rgb(0,149,248); padding:20px; text-align:center;">
                <h2 style="color:#ffffff; margin:0;">AI Chat Assistant</h2>
            </div>

            <div style="padding:25px;text-align:center;">
                <h3 style="color:#111827;">Hello ${name || "User"}</h3>
                <p style="color:#374151; font-size:15px;">
                    You requested a verification code. Please use the OTP below to continue:
                </p>

                <div style="text-align:center; margin:30px 0;">
                    <span style="
                        font-size:28px;
                        letter-spacing:6px;
                        font-weight:bold;
                        background:#f1f5f9;
                        padding:15px 25px;
                        border-radius:8px;
                        display:inline-block;
                        color:rgb(0,149,248);
                    ">
                        ${otp}
                    </span>
                </div>

                <p style="color:#374151; font-size:14px;">
                    This OTP will expire in <b>10 minutes</b>.
                </p>

                <p style="color:#6b7280; font-size:13px;">
                    If you did not request this, please ignore this email.
                </p>

                <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

                <p style="color:#9ca3af; font-size:12px; text-align:center;">
                    © ${new Date().getFullYear()} AI Chat Assistant. All rights reserved.
                </p>
            </div>
        </div>
    </div>
    `;
};


export const sendEmail = async (to, subject, html) => {
    try {
        await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: {
                    name: "AI Chat Assistant",
                    email: process.env.EMAIL_USER
                },
                to: [{ email: to }],
                subject,
                htmlContent: html,
            },
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );
        return { message: "OTP sent to your email", success: true };
    } catch (err) {
        return { data: err.response?.data || err.message, success: false }
    }
};