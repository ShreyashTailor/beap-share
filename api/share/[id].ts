import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { formatBytes } from '../../src/lib/utils';
import fs from 'fs';
import path from 'path';

// Initialize Firebase Admin if not already initialized
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

    // Read the share template
    const templatePath = path.join(process.cwd(), 'public', 'share.html');
    let template = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders with actual data
    template = template
      .replace(/%IMAGE_URL%/g, data.url)
      .replace(/%IMAGE_NAME%/g, data.name || 'Untitled')
      .replace(/%IMAGE_SIZE%/g, formatBytes(data.size || 0))
      .replace(/%UPLOAD_NUMBER%/g, data.uploadNumber?.toString() || '0');

    // Set cache headers for better performance
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Type', 'text/html');
    
    // Send the rendered template
    return res.send(template);

  } catch (error) {
    console.error('Error serving share page:', error);
    if (error.code === 'permission-denied' || error.code === 'resource-exhausted') {
      return res.status(403).json({ error: 'Access to this resource is restricted or quota exceeded' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
} 