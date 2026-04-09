import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, message: "Token missing" }, { status: 400 });
    }

    // Call Google's API with your SECRET key
    const secretKey = process.env.RECAPTCHA_SECRET_KEY; // Add this to .env.local
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    const response = await fetch(verifyUrl, { method: "POST" });
    const data = await response.json();

    // v3 returns a score from 0.0 (bot) to 1.0 (human). 
    // Usually, anything above 0.5 is considered a safe human.
    if (data.success && data.score > 0.5) {
      return NextResponse.json({ success: true, score: data.score });
    } else {
      return NextResponse.json({ success: false, message: "Bot behavior detected!" }, { status: 403 });
    }

  } catch (error) {
    console.error("Captcha verification error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}