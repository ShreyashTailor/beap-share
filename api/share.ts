import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import template from './template';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../beap-share-firebase-adminsdk.json'))
  });
}

const db = admin.firestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).send('Invalid image ID');
  }

  try {
    const doc = await db.collection('images').doc(id).get();
    if (!doc.exists) {
      return res.status(404).send('Image not found');
    }

    const data = doc.data();
    const html = template
      .replace(/%IMAGE_ID%/g, id)
      .replace(/%IMAGE_NAME%/g, data?.name || 'Shared Image')
      .replace(/%IMAGE_URL%/g, data?.url || '')
      .replace(/%IMAGE_SIZE%/g, data?.formattedSize || '')
      .replace(/%UPLOAD_NUMBER%/g, String(data?.uploadNumber || '1'));

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
}
