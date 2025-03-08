import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import formidable from 'formidable'
import { v2 as cloudinary } from 'cloudinary'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const form = formidable({})
    const [fields, files] = await form.parse(req)
    const file = files.file?.[0]
    const tags = fields.tags?.[0]?.split(',') || []

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const result = await cloudinary.uploader.upload(file.filepath, {
      folder: 'charliezard',
      tags: tags,
    })

    res.status(200).json(result)
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Error uploading file' })
  }
} 