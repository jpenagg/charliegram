import { ImageProps } from './types'

export async function getBase64ImageUrl(image: ImageProps, lowQuality = false): Promise<string> {
  const response = await fetch(
    `https://res.cloudinary.com/jpena/image/upload/${
      lowQuality 
        ? 'w_50,h_50,c_fill,e_blur:1000,q_auto:low,f_auto' 
        : 'w_100,e_blur:1000,q_auto:low,f_auto'
    }/v1/${image.public_id}.jpg`
  )
  const buffer = await response.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  return `data:image/jpeg;base64,${base64}`
}
