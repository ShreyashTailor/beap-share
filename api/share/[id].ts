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
    const isDirectAccess = req.headers.accept?.includes('text/html');
    
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

    // If it's Discord's crawler, return HTML with OpenGraph meta tags
    if (isDiscord) {
      const html = `
<!DOCTYPE html>
<html>
<head>
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="BeapShare">
    <meta property="og:title" content="${data.name || 'Untitled'} - BeapShare">
    <meta property="og:description" content="Size: ${formatBytes(data.size || 0)} • Upload #${data.uploadNumber || '0'} • Shared via BeapShare">
    <meta property="og:image" content="${data.url}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${data.url}">
</head>
<body>
    <script>
        window.location.href = "${data.url}";
    </script>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(html);
    }

    // For direct browser access, redirect to the image URL
    if (isDirectAccess) {
      res.setHeader('Location', data.url);
      return res.status(302).end();
    }

    // For API requests, return the image data
    return res.json({
      id: id,
      name: data.name,
      url: data.url,
      size: data.size,
      formattedSize: formatBytes(data.size || 0),
      uploadNumber: data.uploadNumber,
      createdAt: data.createdAt
    });
  } catch (error) {
    console.error('Error serving share page:', error);
    if (error.code === 'permission-denied' || error.code === 'resource-exhausted') {
      return res.status(403).json({ error: 'Access to this resource is restricted or quota exceeded' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
} 