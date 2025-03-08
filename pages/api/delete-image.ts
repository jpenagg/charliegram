import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import { v2 as cloudinary } from 'cloudinary'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { public_id } = req.query

    if (!public_id) {
      return res.status(400).json({ error: 'Image ID is required' })
    }

    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id as string)

    if (result.result === 'ok') {
      res.status(200).json({ message: 'Image deleted successfully' })
    } else {
      res.status(500).json({ error: 'Failed to delete image' })
    }
  } catch (error) {
    console.error('Error deleting image:', error)
    res.status(500).json({ error: 'Failed to delete image' })
  }
} 