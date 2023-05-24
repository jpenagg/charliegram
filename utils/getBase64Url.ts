import { ImageProps } from './types'

export async function getBase64ImageUrl(image: ImageProps): Promise<string> {
  const response = await fetch(`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_jpg,e_blur:1000,q_50/${image.public_id}.${image.format}`)
  const buffer = await response.arrayBuffer()
  const url = `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`
  return url
}
