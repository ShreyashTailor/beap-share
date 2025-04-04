import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../src/lib/firebase';
import { formatBytes } from '../../src/utils/formatBytes';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Image ID is required' });
    }

    // Get image data from Firestore
    const imageDoc = await db.collection('images').doc(id).get();
    
    if (!imageDoc.exists) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const imageData = imageDoc.data();
    if (!imageData) {
      return res.status(404).json({ error: 'Image data not found' });
    }

    // Format the upload time
    const uploadTime = imageData.uploadTime?.toDate();
    const formattedDate = uploadTime ? uploadTime.toLocaleString() : 'Unknown';
    
    // Format file size
    const fileSize = formatBytes(imageData.size || 0);
    
    // Construct the image URL
    const imageUrl = `https://image.beap.studio/api/image/${id}`;
    
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    
    // Return HTML with meta tags for Discord
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${imageData.name || 'Image'}</title>
  
  <!-- Discord Embed Metadata -->
  <meta property="og:title" content="${imageData.name || 'Image'}" />
  <meta property="og:image" content="${imageData.url}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:type" content="image" />
  <meta property="og:description" content="Size: ${fileSize}" />
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
    .time {
      font-size: 14px;
      color: #888;
      margin-top: 10px;
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
    <div class="meta-info">${formattedDate}</div>
    <p>Size: ${fileSize}</p>
    
    <a href="${imageData.url}">
      ${imageData.name || 'Image'}
    </a>
    
    <img src="${imageData.url}" 
         alt="${imageData.name || 'Image'}">
    
    <div class="time">${formattedDate}</div>
  </div>
</body>
</html>
    `;
    
    res.status(200).send(html);
  } catch (error) {
    console.error('Error in image handler:', error);
    res.status(500).json({ error: 'Failed to process image request' });
  }
} 