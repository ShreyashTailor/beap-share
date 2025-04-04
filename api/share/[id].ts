import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid image ID' });
    }

    // Construct the image URL directly
    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/beap-share.appspot.com/o/${id}?alt=media`;

    // Return HTML with meta tags for Discord
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="BeapShare">
    <meta property="og:title" content="Shared Image - BeapShare">
    <meta property="og:description" content="View this image on BeapShare">
    <meta property="og:image" content="${imageUrl}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="theme-color" content="#0A1425">
</head>
<body>
    <script>
        window.location.href = "${imageUrl}";
    </script>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(html);

  } catch (error) {
    console.error('Error serving share page:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 