import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { formatBytes } from '../../src/lib/utils';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
  );

  initializeApp({
    credential: cert(serviceAccount)
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

    // Following your working PHP template structure
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name || 'Shared Image'}</title>

    <!-- Discord Embed Metadata -->
    <meta property="og:title" content="${data.name || 'Shared Image'}" />
    <meta property="og:image" content="${data.url}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:type" content="image" />
    <meta property="og:description" content="Size: ${formatBytes(data.size || 0)}" />
    <meta name="theme-color" content="#4aa8d8">
    <meta name="twitter:card" content="summary_large_image">

    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: left;
            background-color: #181818;
            color: #ddd;
            padding: 20px;
            max-width: 600px;
            margin: auto;
            border-radius: 8px;
        }
        .container {
            background: #222;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
        }
        .meta-info {
            font-size: 14px;
            color: #aaa;
            margin-bottom: 8px;
        }
        h1 {
            font-size: 18px;
            color: #4aa8d8;
            margin: 0 0 10px;
            word-break: break-word;
        }
        img {
            width: 100%;
            height: auto;
            border-radius: 6px;
            margin-top: 10px;
        }
        a {
            color: #4aa8d8;
            text-decoration: none;
            font-weight: bold;
            font-size: 16px;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="meta-info">${new Date().toUTCString()}</div>
        <p>Size: ${formatBytes(data.size || 0)}</p>

        <a href="${data.url}">
            ${data.name || 'Shared Image'}
        </a>

        <img src="${data.url}" 
             alt="${data.name || 'Shared Image'}">

        <div class="time">${new Date().toLocaleString()}</div>
    </div>
</body>
</html>`;

    // Set headers just like in your PHP version
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(html);

  } catch (error) {
    console.error('Error serving share page:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 