import pgPromise from 'pg-promise';

const pgp = pgPromise();

// Database connection configuration
const config = {
  host: 'beapshare-sqlpro.f.aivencloud.com',
  port: 24922,
  database: 'defaultdb',
  user: 'avnadmin',
  password: 'AVNS__-vuihd7XzMrtG1bxIo',
  ssl: {
    rejectUnauthorized: false,
    require: true
  }
};

// Create database instance
export const db = pgp(config);

// Initialize database tables
export async function initDatabase() {
  try {
    // Create images table if it doesn't exist
    await db.none(`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        content_type TEXT NOT NULL,
        size BIGINT NOT NULL,
        image_data TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Function to store an image
export async function storeImage(
  userId: string,
  fileName: string,
  contentType: string,
  size: number,
  imageData: string
): Promise<number> {
  try {
    const result = await db.one(`
      INSERT INTO images (user_id, file_name, content_type, size, image_data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [userId, fileName, contentType, size, imageData]);

    return result.id;
  } catch (error) {
    console.error('Error storing image:', error);
    throw error;
  }
}

// Function to get an image by ID
export async function getImage(id: number) {
  try {
    return await db.oneOrNone(`
      SELECT * FROM images WHERE id = $1
    `, [id]);
  } catch (error) {
    console.error('Error getting image:', error);
    throw error;
  }
}

// Function to get all images for a user
export async function getUserImages(userId: string) {
  try {
    return await db.any(`
      SELECT 
        id,
        user_id,
        file_name,
        content_type,
        size,
        image_data,
        created_at
      FROM images 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `, [userId]);
  } catch (error) {
    console.error('Error getting user images:', error);
    throw error;
  }
}

// Function to delete an image
export async function deleteImage(id: number, userId: string) {
  try {
    const result = await db.result(`
      DELETE FROM images 
      WHERE id = $1 AND user_id = $2
    `, [id, userId]);
    
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

// Function to get total storage used by a user
export async function getUserStorageUsed(userId: string): Promise<number> {
  try {
    const result = await db.one(`
      SELECT COALESCE(SUM(size), 0) as total_size
      FROM images
      WHERE user_id = $1
    `, [userId]);
    
    return parseInt(result.total_size);
  } catch (error) {
    console.error('Error getting user storage:', error);
    throw error;
  }
} 