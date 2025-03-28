import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { formatBytes } from '../../src/lib/utils';

if (!getApps().length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
  );

  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const { id } = req.query;
    const userAgent = req.headers['user-agent'] || '';
    const isDiscord = userAgent.includes('Discord');
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid image ID' });
    }

    // Get image data from Firestore
    const doc = await db.collection('images').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const data = doc.data();
    if (!data) {
      return res.status(404).json({ error: 'Image data not found' });
    }

    // If it's Discord's crawler, return metadata
    if (isDiscord) {
      res.setHeader('Content-Type', 'application/json');
      return res.json({
        title: `${data.name || 'Untitled'} - BeapShare`,
        description: `Size: ${formatBytes(data.size || 0)} • Upload #${data.uploadNumber || '0'} • Shared via BeapShare`,
        type: 'website',
        url: `https://image.beap.studio/share/${id}`,
        image: data.url,
        site_name: 'BeapShare'
      });
    }

    // For regular users, redirect to the image URL
    res.setHeader('Location', data.url);
    return res.status(302).end();
  } catch (error) {
    console.error('Error serving share page:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 