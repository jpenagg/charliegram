import { NextApiRequest, NextApiResponse } from 'next'
import cloudinary from '../../utils/cloudinary'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const allImages = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'charliezard/',
      max_results: 500,
      resource_type: 'image',
      tags: true
    });
    
    const tags = new Set<string>();
    allImages.resources.forEach(image => {
      if (image.tags) {
        image.tags.forEach((tag: string) => tags.add(tag));
      }
    });

    return res.status(200).json({
      tags: Array.from(tags).sort()
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Error fetching tags' });
  }
} 