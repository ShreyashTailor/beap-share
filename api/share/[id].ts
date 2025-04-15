import { VercelRequest, VercelResponse } from '@vercel/node';
import { getImageById } from '../../src/lib/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Image ID is required' });
    }

    const imageData = await getImageById(id);
    
    if (!imageData) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Set proper cache control headers
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Type', 'text/html');

    // Return HTML with proper OpenGraph meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${imageData.name} - BeapShare</title>
    
    <!-- Essential OpenGraph/Discord meta tags -->
    <meta property="og:site_name" content="BeapShare">
    <meta property="og:title" content="${imageData.name}">
    <meta property="og:type" content="website">
    <meta property="og:image" content="${imageData.url}">
    <meta property="og:image:type" content="${imageData.contentType}">
    <meta property="og:description" content="Size: ${imageData.formattedSize}">
    <meta property="og:url" content="https://beap.studio/share/${id}">
    
    <!-- Twitter Card tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${imageData.url}">
    <meta name="twitter:title" content="${imageData.name}">
    
    <!-- Theme color for Discord -->
    <meta name="theme-color" content="#4aa8d8">
    
    <script>
      window.location.href = "https://image.beap.studio/image/${id}";
    </script>
</head>
<body>
    <p>Redirecting to image viewer...</p>
</body>
</html>`;

    return res.send(html);
  } catch (error) {
    console.error('Error in share handler:', error);
    return res.status(500).json({ error: 'Failed to process share request' });
  }
}