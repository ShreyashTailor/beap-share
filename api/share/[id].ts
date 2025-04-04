import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { formatBytes } from '../../src/lib/utils';
import fs from 'fs';
import path from 'path';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
    );

    initializeApp({
      credential: cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
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
    if (!data || !data.url) {
      return res.status(404).json({ error: 'Image data not found' });
    }

    // For Discord and other crawlers, return a simple HTML with meta tags
    const userAgent = req.headers['user-agent'] || '';
    if (userAgent.includes('Discord') || userAgent.includes('bot') || userAgent.includes('crawler')) {
      const html = `
<!DOCTYPE html>
<html>
<head>
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="BeapShare">
    <meta property="og:title" content="${data.name || 'Shared Image'} - BeapShare">
    <meta property="og:description" content="Size: ${formatBytes(data.size || 0)} • Upload #${data.uploadNumber || '0'}">
    <meta property="og:image" content="${data.url}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${data.url}">
    <meta name="theme-color" content="#0A1425">
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
    res.setHeader('Location', data.url);
    return res.status(302).end();

  } catch (error) {
    console.error('Error serving share page:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 