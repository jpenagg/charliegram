import { NextApiRequest, NextApiResponse } from 'next'
import cloudinary from '../../utils/cloudinary'
import { getBase64ImageUrl } from '../../utils/getBase64Url'
import type { ImageProps } from '../../utils/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cursor = '' } = req.query
  const limit = 12

  try {
    const query = cloudinary.v2.search
      .expression('folder:charliezard/*')
      .sort_by('public_id', 'desc')
      .max_results(limit)

    if (cursor) {
      query.next_cursor(cursor as string)
    }

    const results = await query.execute()

    const processedImages = await Promise.all(
      results.resources.map(async (result, index) => {
        const image: ImageProps = {
          id: result.asset_id, // Using Cloudinary's asset_id as a unique identifier
          height: result.height,
          width: result.width,
          public_id: result.public_id,
          format: result.format,
          image: result.secure_url
        }
        const blurDataUrl = await getBase64ImageUrl(image)
        return { ...image, blurDataUrl }
      })
    )

    res.status(200).json({
      images: processedImages,
      next_cursor: results.next_cursor
    })
  } catch (error) {
    console.error('Error loading images:', error)
    res.status(500).json({ error: 'Error loading images' })
  }
} 