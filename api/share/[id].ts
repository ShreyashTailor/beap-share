import { VercelRequest, VercelResponse } from '@vercel/node';
import { getImageById } from '../../src/lib/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid image ID' });
    }

    const imageData = await getImageById(id);
    
    if (!imageData) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Type', 'text/html');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${imageData.name} - BeapShare</title>

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="BeapShare">
    <meta property="og:title" content="${imageData.name}">
    <meta property="og:description" content="Size: ${imageData.formattedSize}">
    <meta property="og:image" content="${imageData.url}">
    <meta property="og:image:type" content="${imageData.contentType}">
    <meta name="theme-color" content="#0A1425">
    <meta name="twitter:card" content="summary_large_image">

    <style>
      body {
        margin: 0;
        padding: 20px;
        background: #181818;
        color: #ddd;
        font-family: system-ui, -apple-system, sans-serif;
      }
      .container {
        max-width: 900px;
        margin: 0 auto;
        background: #222;
        padding: 20px;
        border-radius: 8px;
      }
      .metadata {
        margin-bottom: 20px;
        font-size: 14px;
        color: #888;
      }
      .image-container {
        width: 100%;
        margin-top: 20px;
      }
      img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
      }
    </style>
</head>
<body>
    <div class="container">
      <div class="metadata">
        <h1 style="color: #4aa8d8; margin: 0 0 10px; font-size: 20px;">${imageData.name}</h1>
        <div>Uploaded: ${imageData.formattedTimestamp}</div>
        <div>Size: ${imageData.formattedSize}</div>
      </div>
      
      <div class="image-container">
        <img src="${imageData.url}" alt="${imageData.name}">
      </div>
    </div>
</body>
</html>`;

    return res.send(html);
  } catch (error) {
    console.error('Error in share handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}