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

    // Format file size
    const fileSize = formatBytes(imageData.size || 0);
    
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
  
  <script>
    // Redirect to the image page after a short delay
    setTimeout(() => {
      window.location.href = "https://image.beap.studio/image/${id}";
    }, 100);
  </script>
</head>
<body>
  <p>Redirecting to image page...</p>
</body>
</html>
    `;
    
    res.status(200).send(html);
  } catch (error) {
    console.error('Error in share handler:', error);
    res.status(500).json({ error: 'Failed to process share request' });
  }
} 