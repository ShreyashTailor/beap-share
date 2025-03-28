import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';
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

    // Read the template
    const template = readFileSync(join(process.cwd(), 'public', 'share.html'), 'utf-8');

    // Replace placeholders with actual data
    const html = template
      .replace(/%IMAGE_URL%/g, data.url)
      .replace(/%IMAGE_NAME%/g, data.name || 'Untitled')
      .replace(/%IMAGE_SIZE%/g, formatBytes(data.size || 0))
      .replace(/%UPLOAD_NUMBER%/g, data.uploadNumber?.toString() || '0')
      .replace(/%IMAGE_ID%/g, id);

    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Type', 'text/html');
    
    return res.send(html);
  } catch (error) {
    console.error('Error serving share page:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 