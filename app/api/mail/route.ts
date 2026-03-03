// app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email, name, code } = await request.json();

    // Nodemailer Transporter Setup using OAuth2
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      },
    });

    const mailOptions = {
      from: `"KUDC" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verification Code for Seerath Olympiad',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
          <h2 style="color: #065f46; text-align: center;">KUDC</h2>
          <p>Assalamu Alaikum <strong>${name}</strong>,</p>
          <p>Your payment of 100 BDT has been successfully approved. Please provide the following verification code to our brothers when collecting your "Rasul-E-Arabi" book:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; background-color: #fef3c7; color: #b45309; padding: 10px 20px; border-radius: 8px; letter-spacing: 5px;">
              ${code}
            </span>
          </div>
          <p>Jazakallah Khair!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: 'Email sent successfully via OAuth2' });
  } catch (error) {
    console.error('Error sending email via OAuth2:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}