import type { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';


// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  console.log('Initializing Firebase Admin SDK');
//   var serviceAccount = require("./serviceAccountKey.json");
  if (!process.env.FIREBASE_KEY) {
    throw new Error('FIREBASE_KEY environment variable is not defined');
  }
  const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  console.log('Firebase Admin SDK already initialized');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { token, data } = req.body;

    if (!token || !data) {
      res.status(400).json({ success: false, error: 'Token and message are required' });
      return;
    }

    try {
      await admin.messaging().send({
        token,
        data:data
      });
      res.status(200).json({ success: true, message: 'Message sent!' });
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, error: errorMessage });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
