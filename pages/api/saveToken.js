import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});
// const redis = Redis.fromEnv();
// Temporary storage for tokens (use a database in production)
let tokens = [];

export default async function handler(req, res) {
    // Handle CORS
    // res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    // res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'POST') {
    const { token } = req.body;
    console.log('Token:', token);
    if (!token) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    try {
      // Save the token (avoid duplicates)
      if (!tokens.includes(token)) {
        tokens.push(token);
      }
      // localStorage.setItem('tokens', JSON.stringify(tokens));
      await redis.ping();
      await redis.set('FCM_tokens', JSON.stringify(tokens));

      console.log('Current tokens:', tokens);
      return res.status(200).json({ message: 'Token saved successfully' });
    } catch (error) {
      console.error('Error saving token:', error);
      return res.status(500).json({ error: 'Failed to save token' });
    }
  } else if (req.method === 'GET') {
    return res.status(200).json(tokens);
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
