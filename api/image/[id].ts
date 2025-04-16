import { VercelRequest, VercelResponse } from '@vercel/node';
import { getImageById } from '../../src/lib/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).send('Invalid image ID');
    }

    // Get image data from Firestore
    const imageData = await getImageById(id);
    
    if (!imageData) {
      return res.status(404).send('Image not found');
    }

    // Format the image URL
    const imageUrl = imageData.url;
    
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Type', 'text/html');
    
    // Return HTML with meta tags for Discord embeds
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${imageData.name}</title>
        
        <!-- Discord Embed Metadata -->
        <meta property="og:title" content="${imageData.name}" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="image" />
        <meta property="og:description" content="Size: ${imageData.formattedSize}" />
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
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="meta-info">Uploaded: ${imageData.formattedTimestamp}</div>
          <h1>${imageData.name}</h1>
          <p>Size: ${imageData.formattedSize}</p>
          
          <a href="${imageUrl}" target="_blank">View Original Image</a>
          
          <img src="${imageUrl}" alt="${imageData.name}">
          
          <div class="time">${imageData.formattedTimestamp}</div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error serving image page:', error);
    return res.status(500).send('Internal Server Error');
  }
} 