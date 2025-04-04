import { NextApiRequest, NextApiResponse } from 'next';
import { getImageData } from '../../lib/firebase';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid image ID' });
    }

    // Get image data from Firebase
    const imageData = await getImageData(id);
    
    if (!imageData) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Read the share template
    const templatePath = path.join(process.cwd(), 'public', 'share.html');
    let template = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders with actual data
    template = template.replace(/%IMAGE_URL%/g, imageData.url);
    
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.setHeader('Content-Type', 'text/html');
    
    // Send the rendered template
    res.status(200).send(template);
  } catch (error) {
    console.error('Share page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 