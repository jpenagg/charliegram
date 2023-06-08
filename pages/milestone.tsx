import type { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import cloudinary from '@/utils/cloudinary'
import { getBase64ImageUrl } from '@/utils/getBase64Url'
import type { ImageProps } from '../utils/types'

const Milestone = () => {
  return (
    <div className='text-white text-2xl'>
      Sup Bitch
    </div>
  )
}

export default Milestone

export const getStaticProps: GetStaticProps = async (context) => {

  let results

  const fetchedResults = await cloudinary.v2.search
    .expression(`folder:${process.env.CLOUDINARY_FOLDER}/*`)
    .sort_by('public_id', 'desc')
    .max_results(400)
    .execute()

  results = fetchedResults
  
  let reducedImages: ImageProps[] = []
  let i = 0
  for (let result of results.resources) {
    reducedImages.push({
      id: i,
      height: result.height,
      width: result.width,
      image: result.secure_url,
      public_id: result.public_id,
      format: result.format
    })
    i++
  }

  const currentPhoto = reducedImages.find(
    (img) => img.id === Number(context.params.photoId)
  )
  currentPhoto.blurDataUrl = await getBase64ImageUrl(currentPhoto)

  return {
    props: {
      currentPhoto: currentPhoto,
    },
  }
}
