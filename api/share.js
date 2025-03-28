const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  try {
    const { id } = req.query;
    
    // Get image data from Firestore
    const imageDoc = await db.collection('images').doc(id).get();
    if (!imageDoc.exists) {
      return res.status(404).send('Image not found');
    }

    const imageData = imageDoc.data();
    
    // Read the template
    const template = fs.readFileSync(path.join(process.cwd(), 'public', 'share.html'), 'utf-8');
    
    // Replace the image URL
    const html = template.replace(/%IMAGE_URL%/g, imageData.url);
    
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.setHeader('Content-Type', 'text/html');
    
    return res.send(html);
  } catch (error) {
    console.error('Error serving share page:', error);
    return res.status(500).send('Internal Server Error');
  }
}; 