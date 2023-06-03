import Image from "next/image";
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import type { ImageProps } from "../../utils/types"
import cloudinary from "../../utils/cloudinary"
import { getBase64ImageUrl } from "../../utils/getBase64Url";

const Home: NextPage = ({
  currentPhoto,
}: {
  currentPhoto: ImageProps
}) => {

  return (  
    <div className="flex items-center justify-center h-screen px-2 mx-2">
      <Image
          src={currentPhoto.image}
          width="750"
          height="1000"
          alt=""
          className="mb-4 rounded-lg"
          placeholder="blur"
          blurDataURL={currentPhoto.blurDataUrl}
        />
    </div>
  )
}

export default Home

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

export const getStaticPaths: GetStaticPaths = async () => {
  const results = await cloudinary.v2.search
    .expression(`folder:${process.env.CLOUDINARY_FOLDER}/*`)
    .sort_by('public_id', 'desc')
    .max_results(400)
    .execute()

  let fullPaths = []
  for (let i = 0; i < results.resources.length; i++) {
    fullPaths.push({ params: { photoId: i.toString() } })
  }

  return {
    paths: fullPaths,
    fallback: false,
  }
}
