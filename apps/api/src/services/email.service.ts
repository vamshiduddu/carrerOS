const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.RESEND_FROM ?? 'CareerOS <noreply@careeros.app>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
	if (!RESEND_API_KEY) {
		console.log('[email] Would send email:');
		console.log(`  To: ${to}`);
		console.log(`  Subject: ${subject}`);
		console.log(`  Body: ${html}`);
		return;
	}

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${RESEND_API_KEY}`
		},
		body: JSON.stringify({
			from: FROM_ADDRESS,
			to,
			subject,
			html
		})
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(`Resend API error ${response.status}: ${body}`);
	}
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
	const subject = 'Welcome to CareerOS!';
	const html = `
    <h1>Welcome to CareerOS, ${name}!</h1>
    <p>We're excited to have you on board. CareerOS helps you manage your job search, build your resume, and prepare for interviews — all in one place.</p>
    <p>Get started by completing your profile and exploring the dashboard.</p>
    <p>Good luck with your job search!</p>
    <p>— The CareerOS Team</p>
  `;
	await sendEmail(to, subject, html);
}

export async function sendVerificationEmail(
	to: string,
	name: string,
	token: string,
	appUrl: string
): Promise<void> {
	const verificationLink = `${appUrl}/verify-email?token=${token}`;
	const subject = 'Verify your CareerOS email address';
	const html = `
    <h1>Hi ${name},</h1>
    <p>Please verify your email address by clicking the link below:</p>
    <p><a href="${verificationLink}">${verificationLink}</a></p>
    <p>This link will expire in 24 hours.</p>
    <p>If you did not create a CareerOS account, you can safely ignore this email.</p>
    <p>— The CareerOS Team</p>
  `;
	await sendEmail(to, subject, html);
}

export async function sendPasswordResetEmail(
	to: string,
	name: string,
	token: string,
	appUrl: string
): Promise<void> {
	const resetLink = `${appUrl}/reset-password?token=${token}`;
	const subject = 'Reset your CareerOS password';
	const html = `
    <h1>Hi ${name},</h1>
    <p>We received a request to reset your CareerOS password. Click the link below to choose a new password:</p>
    <p><a href="${resetLink}">${resetLink}</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    <p>— The CareerOS Team</p>
  `;
	await sendEmail(to, subject, html);
}
