import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    // We now receive full user objects as 'recipients' instead of just an array of emails
    const { recipients, subject, body } = await request.json();

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

    // Loop through each recipient and send an individual, personalized email
    const emailPromises = recipients.map((user: any) => {
      
      // Replace shortcodes dynamically!
      let personalizedBody = body;
      personalizedBody = personalizedBody.replace(/{{fullName}}/g, user.fullName || '');
      personalizedBody = personalizedBody.replace(/{{email}}/g, user.email || '');
      personalizedBody = personalizedBody.replace(/{{phone}}/g, user.phone || '');
      personalizedBody = personalizedBody.replace(/{{discipline}}/g, user.discipline || '');
      personalizedBody = personalizedBody.replace(/{{userType}}/g, user.userType || '');
      personalizedBody = personalizedBody.replace(/{{id_designation}}/g, user.studentId || user.designation || '');
      personalizedBody = personalizedBody.replace(/{{verificationCode}}/g, user.verificationCode || 'প্রযোজ্য নয় (N/A)');

      const mailOptions = {
        from: `"নূর একাডেমি" <${process.env.EMAIL_USER}>`,
        to: user.email, // Sending directly to the user (no BCC needed anymore)
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
            <h2 style="color: #065f46; text-align: center; border-bottom: 2px solid #ecfdf5; padding-bottom: 10px;">নূর একাডেমি</h2>
            <div style="margin-top: 20px; color: #374151; line-height: 1.8; font-size: 16px;">
              ${personalizedBody.replace(/\n/g, '<br/>')}
            </div>
          </div>
        `,
      };

      return transporter.sendMail(mailOptions);
    });

    // Wait for all personalized emails to finish sending
    await Promise.all(emailPromises);

    return NextResponse.json({ success: true, message: 'Bulk personalized emails sent successfully' });
  } catch (error) {
    console.error('Error sending bulk personalized email:', error);
    return NextResponse.json({ success: false, error: 'Failed to send emails' }, { status: 500 });
  }
}