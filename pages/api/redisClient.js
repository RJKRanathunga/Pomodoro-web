import redis from '../../app/data/Redis storage';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { key } = req.query; // Get the key from query parameters
      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }
      const value = await redis.get(key);
      return res.status(200).json({ value });
    } else if (req.method === 'POST') {
      const { key, value } = req.body; // Get the key and value from the request body
      if (!key || value === undefined) {
        return res.status(400).json({ error: 'Key and value are required' });
      }
      await redis.set(key, value);
      return res.status(200).json({ message: 'Data stored successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error interacting with Redis:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}