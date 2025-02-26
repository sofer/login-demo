import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendMagicLink(email: string, token: string) {
  try {
    // Determine the base URL based on the environment
    let baseUrl: string;

    console.log('Environment variables for URL construction:');
    console.log(`REPL_ID: ${process.env.REPL_ID}`);
    console.log(`REPL_SLUG: ${process.env.REPL_SLUG}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

    if (process.env.NODE_ENV === 'production') {
      // We're in production
      baseUrl = 'https://login-demo-dsofer.replit.app';
      console.log(`Using production URL: ${baseUrl}`);
    } else {
      // Local development or dev environment
      baseUrl = 'http://localhost:5000';
      if (process.env.REPL_ID && process.env.REPL_SLUG) {
        baseUrl = `https://${process.env.REPL_SLUG}.${process.env.REPL_ID}.repl.co`;
      }
      console.log(`Using development URL: ${baseUrl}`);
    }

    // Construct the verification URL
    const verifyUrl = `${baseUrl}/verify?token=${token}`;
    console.log(`Generated verification URL: ${verifyUrl}`);

    await transporter.sendMail({
      from: `"Auth Demo" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Magic Link",
      text: `Click this link to sign in: ${verifyUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; margin-bottom: 24px;">Welcome to Auth Demo</h1>
          <p style="color: #666; margin-bottom: 24px;">Click the button below to sign in:</p>
          <a 
            href="${verifyUrl}"
            style="display: inline-block; background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 500;"
          >
            Sign In
          </a>
          <p style="color: #666; margin-top: 24px; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
            <br>
            ${verifyUrl}
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error("Failed to send magic link:", error);
    throw new Error("Failed to send magic link. Please try again later.");
  }
}