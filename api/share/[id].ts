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

    // Set cache control headers for Discord's crawler
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Type', 'text/html');

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
    <meta property="og:url" content="https://image.beap.studio/share/${id}">
    <meta property="og:image" content="${imageData.url}">
    <meta property="og:description" content="Size: ${imageData.formattedSize}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${imageData.url}">
    <meta name="twitter:title" content="${imageData.name}">
    
    <!-- Theme color for Discord -->
    <meta name="theme-color" content="#4aa8d8">

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
      img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
      }
    </style>
</head>
<body>
    <div class="container">
      <h1>${imageData.name}</h1>
      <p>Size: ${imageData.formattedSize}</p>
      <img src="${imageData.url}" alt="${imageData.name}">
    </div>
    <script>
      // Optional: Redirect to image view after a short delay
      setTimeout(() => {
        window.location.href = "/image/${id}";
      }, 100);
    </script>
</body>
</html>`;

    return res.send(html);
  } catch (error) {
    console.error('Error in share handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}