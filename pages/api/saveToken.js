import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });

  if (req.method === 'POST') {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    try {
      const storedTokens = await redis.get('FCM_tokens');
      let tokens = [];
      if (storedTokens) {
        try {
          tokens = JSON.parse(storedTokens);
        } catch (error) {
          console.error('Error parsing tokens:', error);
          tokens = [storedTokens]; // Handle legacy data
        }
      }

      // Add the new token if it doesn't already exist
      if (!tokens.includes(token)) {
        tokens.push(token);
        await redis.set('FCM_tokens', JSON.stringify([token])); // Save back to Redis
      }

      return res.status(200).json({ message: 'Token saved successfully' });
    } catch (error) {
      console.error('Error saving token:', error);
      return res.status(500).json({ error: 'Failed to save token' });
    }
  } else if (req.method === 'GET') {
    try {
      const storedTokens = await redis.get('FCM_tokens');
      let tokens = [];
      console.log('storedTokens:', storedTokens);
      console.log('storedTokens type:', typeof storedTokens);
      console.log('storedTokens 1st:', storedTokens[0]);
      console.log('storedTokens json:', JSON.parse(storedTokens));
      if (storedTokens) {
        try {
          tokens = JSON.parse(storedTokens);
        } catch (error) {
          console.error('Error parsing tokens:', error);
          tokens = [storedTokens]; // Handle legacy data
        }
      }

      return res.status(200).json(tokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      return res.status(500).json({ error: 'Failed to fetch tokens' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
