import redis from '../../app/utils/Redis storage';

export default async function handler(req, res) {

  if (req.method === 'POST') {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    try {
      const storedTokens = await redis.get('FCM_tokens');

      // Add the new token if it doesn't already exist
      if (!storedTokens.includes(token)) {
        storedTokens.push(token);
        await redis.set('FCM_tokens', JSON.stringify(storedTokens)); // Save back to Redis
      }

      return res.status(200).json({ message: 'Token saved successfully' });
    } catch (error) {
      console.error('Error saving token:', error);
      return res.status(500).json({ error: 'Failed to save token' });
    }
  } else if (req.method === 'GET') {
    try {
      const storedTokens = await redis.get('FCM_tokens');
      return res.status(200).json(storedTokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      return res.status(500).json({ error: 'Failed to fetch tokens' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
