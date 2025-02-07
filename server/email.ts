import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.forwardemail.net",
  port: 465,
  secure: true,
  auth: {
    user: "REPLACE_WITH_YOUR_EMAIL",
    pass: "REPLACE_WITH_YOUR_PASSWORD"
  }
});

export async function sendMagicLink(email: string, token: string) {
  const verifyUrl = `http://localhost:5000/verify?token=${token}`;
  
  await transporter.sendMail({
    from: '"Auth Demo" <auth@example.com>',
    to: email,
    subject: "Your Magic Link",
    text: `Click this link to sign in: ${verifyUrl}`,
    html: `
      <div>
        <h1>Welcome to Auth Demo</h1>
        <p>Click the button below to sign in:</p>
        <a 
          href="${verifyUrl}"
          style="display: inline-block; background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;"
        >
          Sign In
        </a>
      </div>
    `
  });
}
