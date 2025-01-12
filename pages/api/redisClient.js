import redis_config from '../../app/data/Redis storage';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const value = await redis_config.get('mykey');
      return res.status(200).json({ value });
    }
  } catch (error) {
    console.error('Error interacting with Redis:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}