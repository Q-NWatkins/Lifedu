import { Resend } from 'resend';

const resend = new Resend(process.env.Resend_API_KEY);

export default async function handler(req, res) {
  // Allow simple browser testing
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Pulls target email from request query, body, or your secret env variable
  const recipientEmail = req.query.to || req.body?.to || process.env.TEST_EMAIL;

  if (!recipientEmail) {
    return res.status(400).json({ error: 'No recipient email specified or configured in TEST_EMAIL env.' });
  }

  try {
    const data = await resend.emails.send({
      from: 'Oedipus <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: '🎮 Oedipus Test Email!',
      html: '<h1>Welcome to Oedipus!</h1><p>Your Resend email engine is officially live and working!</p>',
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}