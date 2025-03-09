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
  
  try {
    if (sort === 'random') {
      if (!cursor) {
        // Initial random load - create new session
        const allResults = await cloudinary.search
          .expression('folder:charliezard/*')
          .max_results(500)
          .execute();

        const timestamp = Date.now();
        const session: RandomSession = {
          images: allResults.resources,
          timestamp,
          usedIndices: new Set(),
          totalImages: allResults.resources.length
        };
        randomSessions.set(timestamp, session);

        const unusedIndices = Array.from({ length: session.totalImages }, (_, i) => i);
        const selectedIndices = [];
        
        // Select 12 random unused indices
        while (selectedIndices.length < 12 && unusedIndices.length > 0) {
          const randomIndex = Math.floor(Math.random() * unusedIndices.length);
          const imageIndex = unusedIndices.splice(randomIndex, 1)[0];
          selectedIndices.push(imageIndex);
          session.usedIndices.add(imageIndex);
        }

        const selectedImages = selectedIndices.map(index => allResults.resources[index]);
        const blurImagePromises = selectedImages.map(image => getBase64ImageUrl(image));
        const blurDataUrls = await Promise.all(blurImagePromises);

        const imagesWithBlur = selectedImages.map((image, i) => ({
          public_id: image.public_id,
          blurDataUrl: blurDataUrls[i],
          width: image.width,
          height: image.height
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

      // Get unused indices
      const unusedIndices = Array.from({ length: session.totalImages }, (_, i) => i)
        .filter(i => !session.usedIndices.has(i));

      if (unusedIndices.length === 0) {
        return res.status(200).json({
          images: [],
          next_cursor: null
        });
      }

      // Select next batch of random unused indices
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
        public_id: image.public_id,
        blurDataUrl: blurDataUrls[i],
        width: image.width,
        height: image.height
      }));

      const hasMore = session.usedIndices.size < session.totalImages;
      return res.status(200).json({
        images: imagesWithBlur,
        next_cursor: hasMore ? `${timestamp}_${session.usedIndices.size}` : null
      });
    }

    // Handle asc/desc sorting
    const searchQuery = cloudinary.search
      .expression('folder:charliezard/*')
      .sort_by('created_at', sort === 'asc' ? 'asc' : 'desc')
      .max_results(12);

    if (cursor) {
      searchQuery.next_cursor(cursor);
    }

    const results = await searchQuery.execute();
    const blurImagePromises = results.resources.map(image => 
      getBase64ImageUrl(image)
    );
    const blurDataUrls = await Promise.all(blurImagePromises);

    const imagesWithBlur = results.resources.map((image, i) => ({
      public_id: image.public_id,
      blurDataUrl: blurDataUrls[i],
      width: image.width,
      height: image.height
    }));

    return res.status(200).json({
      images: imagesWithBlur,
      next_cursor: results.next_cursor
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Error loading images' });
  }
} 