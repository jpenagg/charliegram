import { NextApiRequest, NextApiResponse } from 'next'
import cloudinary from '../../utils/cloudinary'
import { getBase64ImageUrl } from '../../utils/getBase64Url'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cursor } = req.query

  try {
    const results = await cloudinary.search
      .expression('folder:charliezard/*')
      .sort_by('created_at', 'desc')
      .max_results(12)
      .next_cursor(cursor as string)
      .execute()

    const blurImagePromises = results.resources.map(image => 
      getBase64ImageUrl(image)
    )
    const blurDataUrls = await Promise.all(blurImagePromises)

    const imagesWithBlur = results.resources.map((image, i) => ({
      ...image,
      blurDataUrl: blurDataUrls[i]
    }))

    res.status(200).json({
      images: imagesWithBlur,
      next_cursor: results.next_cursor
    })
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Error loading images' })
  }
} 