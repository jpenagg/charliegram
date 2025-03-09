import { NextApiRequest, NextApiResponse } from 'next'
import cloudinary from '../../utils/cloudinary'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    console.log('Session:', session);

    if (!session) {
      console.log('No session found');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { public_id, tag } = req.body;

    if (!public_id || !tag) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Add the folder prefix if it doesn't exist
    const fullPublicId = `charliezard/${public_id}`;
    console.log('Attempting to remove tag:', { originalPublicId: public_id, fullPublicId, tag });

    try {
      // Remove the tag using the uploader API
      const result = await cloudinary.uploader.remove_tag(tag, [fullPublicId], {
        resource_type: 'image'
      });
      
      console.log('Cloudinary response:', result);

      // Get the updated image to return the current tags
      const updatedImage = await cloudinary.api.resource(fullPublicId, {
        resource_type: 'image'
      });

      return res.status(200).json({
        success: true,
        tags: updatedImage.tags || []
      });
    } catch (cloudinaryError: any) {
      console.error('Cloudinary error details:', {
        message: cloudinaryError.message,
        name: cloudinaryError.name,
        http_code: cloudinaryError.http_code,
        error: cloudinaryError.error
      });
      throw new Error(`Cloudinary error: ${cloudinaryError.message}`);
    }
  } catch (error: any) {
    console.error('Error removing tag:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Error removing tag',
      details: error.message
    });
  }
} 