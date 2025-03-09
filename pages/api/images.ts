import { NextApiRequest, NextApiResponse } from 'next'
import cloudinary from '../../utils/cloudinary'
import { getBase64ImageUrl } from '../../utils/getBase64Url'

interface RandomSession {
  images: any[];
  timestamp: number;
  usedIndices: Set<number>;
  totalImages: number;
}

// Store multiple random sessions
const randomSessions = new Map<number, RandomSession>();

// Cleanup old sessions periodically (older than 1 hour)
setInterval(() => {
  const oneHourAgo = Date.now() - 3600000;
  Array.from(randomSessions.keys()).forEach(timestamp => {
    if (timestamp < oneHourAgo) {
      randomSessions.delete(timestamp);
    }
  });
}, 300000); // Clean every 5 minutes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
  const sort = typeof req.query.sort === 'string' ? req.query.sort : 'desc';
  const tag = typeof req.query.tag === 'string' ? req.query.tag : undefined;
  
  try {
    if (sort === 'random') {
      if (!cursor) {
        const allResults = await cloudinary.api.resources({
          type: 'upload',
          prefix: 'charliezard/',
          max_results: 500,
          resource_type: 'image',
          tags: true  // Explicitly request tags
        });

        // Filter by tag if specified
        let resources = allResults.resources;
        if (tag) {
          resources = resources.filter(img => Array.isArray(img.tags) && img.tags.includes(tag));
        }

        const timestamp = Date.now();
        const session: RandomSession = {
          images: resources,
          timestamp,
          usedIndices: new Set(),
          totalImages: resources.length
        };
        randomSessions.set(timestamp, session);

        const unusedIndices = Array.from({ length: session.totalImages }, (_, i) => i);
        const selectedIndices = [];
        
        while (selectedIndices.length < 12 && unusedIndices.length > 0) {
          const randomIndex = Math.floor(Math.random() * unusedIndices.length);
          const imageIndex = unusedIndices.splice(randomIndex, 1)[0];
          selectedIndices.push(imageIndex);
          session.usedIndices.add(imageIndex);
        }

        const selectedImages = selectedIndices.map(index => resources[index]);
        const blurImagePromises = selectedImages.map(image => getBase64ImageUrl(image));
        const blurDataUrls = await Promise.all(blurImagePromises);

        const imagesWithBlur = selectedImages.map((image, i) => ({
          id: image.asset_id || image.public_id,
          public_id: image.public_id,
          blurDataUrl: blurDataUrls[i],
          width: image.width,
          height: image.height,
          format: image.format || 'jpg',
          tags: Array.isArray(image.tags) ? image.tags : []
        }));

        return res.status(200).json({
          images: imagesWithBlur,
          next_cursor: `${timestamp}_${selectedImages.length}`
        });
      }

      // Handle pagination for random mode
      const [timestamp, startIndex] = cursor.split('_').map(Number);
      const session = randomSessions.get(timestamp);

      if (!session) {
        return res.status(400).json({ error: 'Random session expired' });
      }

      const unusedIndices = Array.from({ length: session.totalImages }, (_, i) => i)
        .filter(i => !session.usedIndices.has(i));

      if (unusedIndices.length === 0) {
        return res.status(200).json({
          images: [],
          next_cursor: null
        });
      }

      const selectedIndices = [];
      const tempUnused = [...unusedIndices];
      
      while (selectedIndices.length < 12 && tempUnused.length > 0) {
        const randomIndex = Math.floor(Math.random() * tempUnused.length);
        const imageIndex = tempUnused.splice(randomIndex, 1)[0];
        selectedIndices.push(imageIndex);
        session.usedIndices.add(imageIndex);
      }

      const selectedImages = selectedIndices.map(index => session.images[index]);
      const blurImagePromises = selectedImages.map(image => getBase64ImageUrl(image));
      const blurDataUrls = await Promise.all(blurImagePromises);

      const imagesWithBlur = selectedImages.map((image, i) => ({
        id: image.asset_id || image.public_id,
        public_id: image.public_id,
        blurDataUrl: blurDataUrls[i],
        width: image.width,
        height: image.height,
        format: image.format || 'jpg',
        tags: Array.isArray(image.tags) ? image.tags : []
      }));

      const hasMore = session.usedIndices.size < session.totalImages;
      return res.status(200).json({
        images: imagesWithBlur,
        next_cursor: hasMore ? `${timestamp}_${session.usedIndices.size}` : null
      });
    }

    // Handle asc/desc sorting
    let expression = 'folder:charliezard/*';
    if (tag) {
      expression += ` AND tags:${tag}`;
    }

    const results = await cloudinary.search
      .expression(expression)
      .with_field('tags')
      .max_results(12)
      .sort_by('created_at', sort === 'asc' ? 'asc' : 'desc')
      .next_cursor(cursor)
      .execute();

    const resources = results.resources;
    
    const blurImagePromises = resources.map(image => 
      getBase64ImageUrl(image)
    );
    const blurDataUrls = await Promise.all(blurImagePromises);

    const imagesWithBlur = resources.map((image, i) => ({
      id: image.asset_id || image.public_id,
      public_id: image.public_id,
      blurDataUrl: blurDataUrls[i],
      width: image.width,
      height: image.height,
      format: image.format || 'jpg',
      tags: Array.isArray(image.tags) ? image.tags : []
    }));

    console.log('API response images with tags:', imagesWithBlur.map(img => ({ id: img.id, tags: img.tags })));

    return res.status(200).json({
      images: imagesWithBlur,
      next_cursor: results.next_cursor
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Error loading images' });
  }
} 