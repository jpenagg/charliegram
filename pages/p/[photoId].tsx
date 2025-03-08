import type { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { ImageProps } from '../../utils/types'
import cloudinary from '../../utils/cloudinary'
import { getBase64ImageUrl } from '../../utils/getBase64Url'

export default function PhotoPage({ photo }: { photo: ImageProps }) {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Photo</title>
      </Head>
      <div className="flex items-center justify-center h-screen px-2 mx-2">
        <Image
          src={`https://res.cloudinary.com/jpena/image/upload/v1/${photo.public_id}.jpg`}
          width={750}
          height={1000}
          alt="Photo of Charlie"
          className="rounded-lg shadow-lg"
          placeholder="blur"
          blurDataURL={photo.blurDataUrl}
          priority
        />
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const results = await cloudinary.api.resources({
    type: 'upload',
    prefix: 'charliezard/',
    max_results: 100
  })

  const photo = results.resources.find(r => r.public_id === params?.photoId)
  if (!photo) {
    return {
      notFound: true
    }
  }

  const blurDataUrl = await getBase64ImageUrl(photo)

  return {
    props: {
      photo: {
        ...photo,
        blurDataUrl
      }
    }
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const results = await cloudinary.api.resources({
    type: 'upload',
    prefix: 'charliezard/',
    max_results: 100
  })

  const paths = results.resources.map(photo => ({
    params: {
      photoId: photo.public_id
    }
  }))

  return {
    paths,
    fallback: 'blocking'
  }
}
