import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Allow simple testing via browser GET or POST
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = await resend.emails.send({
      from: 'Oedipus <onboarding@resend.dev>',
      to: [process.env.TEST_EMAIL], // ⚠️ REPLACE THIS WITH THE EXACT EMAIL YOU SIGNED UP TO RESEND WITH
      subject: '🎮 Oedipus Test Email!',
      html: '<h1>Welcome to Oedipus!</h1><p>Your Resend email engine is officially live and working!</p>',
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}