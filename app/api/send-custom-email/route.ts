import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
    // Added 'isPersonalized' to the incoming request
    const { recipients, subject, body, isPersonalized } = await request.json();

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ success: false, error: 'No recipients provided' }, { status: 400 });
    }

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

    // --- MODE 1: STANDARD BCC EMAIL (FAST) ---
    if (!isPersonalized) {
      const bccEmails = recipients.map((r: any) => r.email).filter(Boolean);
      
      const mailOptions = {
        from: `"KUDC" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Send to self
        bcc: bccEmails,             // BCC everyone else
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
            <h2 style="color: #065f46; text-align: center; border-bottom: 2px solid #ecfdf5; padding-bottom: 10px;">খুলনা বিশ্ববিদ্যালয় দ্বীনি কমিউনিটি </h2>
            <div style="margin-top: 20px; color: #374151; line-height: 1.8; font-size: 16px;">
              ${body.replace(/\n/g, '<br/>')}
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      return NextResponse.json({ success: true, message: `BCC email sent successfully to ${bccEmails.length} recipients.` });
    }

    // --- MODE 2: PERSONALIZED EMAIL LOOP (SLOW & SAFE) ---
    let successCount = 0;
    for (const user of recipients) {
      let personalizedBody = body;
      personalizedBody = personalizedBody.replace(/{{fullName}}/g, user.fullName || '');
      personalizedBody = personalizedBody.replace(/{{email}}/g, user.email || '');
      personalizedBody = personalizedBody.replace(/{{phone}}/g, user.phone || '');
      personalizedBody = personalizedBody.replace(/{{discipline}}/g, user.discipline || '');
      personalizedBody = personalizedBody.replace(/{{userType}}/g, user.userType || '');
      personalizedBody = personalizedBody.replace(/{{id_designation}}/g, user.studentId || user.designation || '');
      personalizedBody = personalizedBody.replace(/{{verificationCode}}/g, user.verificationCode || 'প্রযোজ্য নয় (N/A)');

      const mailOptions = {
        from: `"KUDC" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
            <h2 style="color: #065f46; text-align: center; border-bottom: 2px solid #ecfdf5; padding-bottom: 10px;">খুলনা বিশ্ববিদ্যালয় দ্বীনি কমিউনিটি</h2>
            <div style="margin-top: 20px; color: #374151; line-height: 1.8; font-size: 16px;">
              ${personalizedBody.replace(/\n/g, '<br/>')}
            </div>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        successCount++;
        await delay(2000); // 2-second delay to prevent spam flagging
      } catch (err) {
        console.error(`Failed to send email to ${user.email}:`, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully sent ${successCount} personalized emails.` 
    });

  } catch (error) {
    console.error('Error in bulk email process:', error);
    return NextResponse.json({ success: false, error: 'Failed to process emails' }, { status: 500 });
  }
}